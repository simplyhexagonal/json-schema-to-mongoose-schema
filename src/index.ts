import _ from 'lodash';
import { Schema, SchemaDefinitionProperty } from 'mongoose';

// @ts-ignore
export { version } from '../package.json';

export const schemaTypeMap = {
  'string': String,
  'boolean': Boolean,
  'number': Number,
  'integer': Number,
};

export interface JsonSchemaBaseType {
  type: keyof typeof schemaTypeMap,
  pattern?: string,
  minLength?: number,
  maxLength?: number,
  minimum?: number,
  maximum?: number,
  enum?: string[],
  format?: string,
}

export interface JsonSchemaArrayType {
  type: 'array',
  minItems?: number,
  maxItems?: number,
  items: JsonSchemaArrayType | JsonSchemaBaseType | JsonSchemaObjectType,
}

export interface JsonSchemaObjectType {
  type: 'object',
  properties: { [k: string | symbol]: JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType },
  required?: string[],
}

export interface JsonSchema {
  $schema: string,
  definitions: { [k: string | symbol]: JsonSchemaObjectType },
}

export type Validation = [((val: any[]) => boolean), string] | [];

export const genArrayLimit = (minItems?: number, maxItems?: number): Validation => {
  const hasMin = typeof minItems === 'number';
  const hasMax = typeof maxItems === 'number';

  if (hasMin && hasMax) {
    return [
      (val: any[]) => (val.length >= minItems && val.length <= maxItems),
      `{PATH} is not within range (${minItems} to ${maxItems} items)`
    ];
  } else if (hasMin) {
    return [
      (val: any[]) => (val.length >= minItems),
      `{PATH} must have at least ${minItems} items`
    ];
  } else if (hasMax) {
    return [
      (val: any[]) => (val.length <= maxItems),
      `{PATH} exceeds the limit of ${maxItems} items`
    ];
  }

  return [];
}

export const typeHandler = (schemaType: JsonSchemaBaseType, required?: boolean) => {
  const {
    type: schemaTypeType,
    pattern: match,
    minLength,
    maxLength,
    minimum: min,
    maximum: max,
    format,
    enum: enumValues,
  } = schemaType;

  if (schemaTypeMap.hasOwnProperty(schemaTypeType)) {
    return {
      type: (format === 'date-time') ? Date : schemaTypeMap[schemaTypeType],
      match,
      minLength,
      maxLength,
      min,
      max,
      enum: enumValues,
      required,
    };
  }

  throw new Error(`Unsupported schema type: ${schemaType}`);
};

export const handleProperty = (
  key: string,
  property: JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType,
  subSchemaHandler: (
    key: string,
    subSchema: JsonSchemaObjectType | JsonSchemaArrayType,
    required?: string[],
  ) => void,
  subTypeHandler: (
    key: string,
    schemaType: JsonSchemaBaseType,
  ) => void,
) => {
  if (!_.isPlainObject(property)) {
    throw new Error(`Invalid JSON Schema, ${key} is not an object`);
  }

  if (!property.hasOwnProperty('type')) {
    throw new Error(`Invalid JSON Schema, ${key} is missing type`);
  }

  if ((/array|object/).test(property.type)) {
    subSchemaHandler(key, property as JsonSchemaObjectType | JsonSchemaArrayType);
    return;
  }

  subTypeHandler(key, property as JsonSchemaBaseType);
};

export const traverseDefinitions = (
  definitions: JsonSchema['definitions'] | JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType,
  definitionKey?: string,
) => {
  const schema = new Schema();

  const schemaDefinition = (
    definitionKey
  ) ? (
    (definitions as JsonSchema['definitions'])[definitionKey]
  ) : (
    definitions as JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType
  );

  if (!_.isPlainObject(schemaDefinition)) {
    throw new Error(`Invalid JSON Schema, definition is not an object`);
  }

  if (!schemaDefinition.hasOwnProperty('type')) {
    throw new Error(`Invalid JSON Schema, missing type while traversing definitions`);
  }

  if (definitionKey && schemaDefinition.type !== 'object') {
    throw new Error(`Invalid JSON Schema, expected type to be 'object' for ${definitionKey}`);
  }

  if (schemaDefinition.type === 'object') {
    const subSchemas: [string, (JsonSchemaObjectType | JsonSchemaArrayType)][] = [];

    _.forEach(
      (schemaDefinition as JsonSchemaObjectType).properties || [],
      (p, key) => {
        handleProperty(
          key,
          p,
          (key, subSchema) => {
            subSchemas.push([key, subSchema]);
          },
          (key, schemaType) => {
            schema.add(
              {
                [key]: typeHandler(
                  schemaType,
                  _.includes((schemaDefinition as JsonSchemaObjectType).required || [], key),
                ) as SchemaDefinitionProperty<any>,
              },
            );
          }
        );
      }
    );

    _.forEach(subSchemas, ([key, subSchema]) => {
      const subSchemaType = (
        subSchema.type === 'array'
      ) ? (
        [traverseDefinitions(subSchema.items)]
      ) : (
        traverseDefinitions(subSchema)
      );

      const validate = genArrayLimit(
        (subSchema as JsonSchemaArrayType).minItems,
        (subSchema as JsonSchemaArrayType).maxItems,
      );

      schema.add(
        {
          [key]: {
            type: subSchemaType,
            required: _.includes((schemaDefinition as JsonSchemaObjectType).required || [], key),
            validate,
          }
        },
      );
    });

    return schema;
  }

  if (schemaDefinition.type === 'array') {
    schema.add(
      {
        type: traverseDefinitions(schemaDefinition.items),
      },
    );

    return schema;
  }

  return typeHandler(
    schemaDefinition,
    false,
  ) as SchemaDefinitionProperty<any>;
};

const jsonSchemaToMongooseSchema = (jsonSchema: JsonSchema, definitionKey: string) => {
  if (!(/draft-(0[4-9]|[1-9][0-9])/).test(_.get(jsonSchema, '$schema', 'draft-00'))) {
    throw new Error('Invalid JSON Schema, expected $schema to be draft-04 or greater');
  }

  const definitions = jsonSchema.definitions;

  if (_.isPlainObject(definitions) && definitions.hasOwnProperty(definitionKey)) {
    const schema = traverseDefinitions(definitions, definitionKey);

    return schema as Schema<JsonSchema>;
  }

  throw new Error('Invalid JSON Schema');
};

export default jsonSchemaToMongooseSchema;
