var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/index.ts
__export(exports, {
  default: () => src_default,
  genArrayLimit: () => genArrayLimit,
  handleProperty: () => handleProperty,
  processAnyOf: () => processAnyOf,
  schemaTypeMap: () => schemaTypeMap,
  traverseDefinitions: () => traverseDefinitions,
  typeHandler: () => typeHandler,
  version: () => version
});
var import_lodash = __toModule(require("lodash"));
var import_mongoose = __toModule(require("mongoose"));

// package.json
var version = "1.2.2";

// src/index.ts
var schemaTypeMap = {
  "string": String,
  "boolean": Boolean,
  "number": Number,
  "integer": Number
};
var genArrayLimit = (minItems, maxItems) => {
  const hasMin = typeof minItems === "number";
  const hasMax = typeof maxItems === "number";
  if (hasMin && hasMax) {
    return [
      (val) => val.length >= minItems && val.length <= maxItems,
      `{PATH} is not within range (${minItems} to ${maxItems} items)`
    ];
  } else if (hasMin) {
    return [
      (val) => val.length >= minItems,
      `{PATH} must have at least ${minItems} items`
    ];
  } else if (hasMax) {
    return [
      (val) => val.length <= maxItems,
      `{PATH} exceeds the limit of ${maxItems} items`
    ];
  }
  return [];
};
var typeHandler = (schemaType, required) => {
  const {
    type: schemaTypeType,
    pattern,
    minLength,
    maxLength,
    minimum: min,
    maximum: max,
    format,
    enum: enumValues
  } = schemaType;
  if (schemaTypeMap.hasOwnProperty(schemaTypeType)) {
    return {
      type: format === "date-time" ? Date : schemaTypeMap[schemaTypeType],
      match: pattern ? new RegExp(pattern) : new RegExp(/.*/gim),
      minLength,
      maxLength,
      min,
      max,
      enum: enumValues,
      required
    };
  }
  throw new Error(`Unsupported schema type: ${schemaType}`);
};
var processAnyOf = (property) => {
  const { anyOf } = property;
  if (!import_lodash.default.isArray(anyOf)) {
    throw new Error("Invalid JSON Schema, expected anyOf to be an array");
  }
  if (anyOf.length === 0) {
    throw new Error("Invalid JSON Schema, expected anyOf to have at least one item");
  }
  if (anyOf.length === 1) {
    throw new Error("Invalid JSON Schema, expected anyOf to have more than one item");
  }
  const onlyObjects = anyOf.reduce((a, b) => {
    return a && b.type === "object";
  }, true);
  if (!onlyObjects) {
    throw new Error("Invalid JSON Schema, expected anyOf to only contain objects");
  }
  return anyOf.reduce((a, b) => {
    import_lodash.default.forEach(b.properties, (value, key) => {
      let subProperty;
      if (value.anyOf) {
        subProperty = processAnyOf(value);
      } else {
        subProperty = value;
      }
      if (!a.properties.hasOwnProperty(key)) {
        a.properties[key] = subProperty;
      } else {
        if (a.properties[key].type !== subProperty.type) {
          console.log(a.properties[key], subProperty);
          throw new Error(`Invalid JSON Schema, expected anyOf to only contain objects with identical properties`);
        }
        a.properties[key] = import_lodash.default.mergeWith(a.properties[key], subProperty, (objValue, srcValue) => {
          if (import_lodash.default.isArray(objValue)) {
            return objValue.concat(srcValue);
          }
          if (import_lodash.default.isPlainObject(objValue)) {
            return import_lodash.default.merge(objValue, srcValue);
          }
          if (objValue !== srcValue) {
            throw new Error(`Invalid JSON Schema, values of types other than object or array must be identical`);
          }
          return objValue;
        });
      }
    });
    a.required = (a.required || []).concat(b.required || []);
    return a;
  }, {
    type: "object",
    properties: {},
    required: []
  });
};
var handleProperty = (key, property, subSchemaHandler, subTypeHandler) => {
  if (!import_lodash.default.isPlainObject(property)) {
    throw new Error(`Invalid JSON Schema, ${key} is not an object`);
  }
  if (!property.hasOwnProperty("type") && !property.hasOwnProperty("anyOf")) {
    throw new Error(`Invalid JSON Schema, ${key} is missing type`);
  }
  let finalProperty;
  if (property.hasOwnProperty("anyOf")) {
    finalProperty = processAnyOf(property);
  } else {
    finalProperty = property;
  }
  if (/array|object/.test(finalProperty.type)) {
    subSchemaHandler(key, finalProperty);
    return;
  }
  subTypeHandler(key, finalProperty);
};
var traverseDefinitions = (definitions, definitionKey) => {
  const schema = new import_mongoose.Schema();
  const schemaDefinition = definitionKey ? definitions[definitionKey] : definitions.hasOwnProperty("anyOf") ? processAnyOf(definitions) : definitions;
  if (!import_lodash.default.isPlainObject(schemaDefinition)) {
    throw new Error(`Invalid JSON Schema, definition is not an object`);
  }
  if (!schemaDefinition.hasOwnProperty("type")) {
    throw new Error(`Invalid JSON Schema, missing type while traversing definitions`);
  }
  if (definitionKey && schemaDefinition.type !== "object") {
    throw new Error(`Invalid JSON Schema, expected type to be 'object' for ${definitionKey}`);
  }
  if (schemaDefinition.type === "object") {
    const subSchemas = [];
    import_lodash.default.forEach(schemaDefinition.properties || [], (p, key) => {
      handleProperty(key, p, (key2, subSchema) => {
        subSchemas.push([key2, subSchema]);
      }, (key2, schemaType) => {
        schema.add({
          [key2]: typeHandler(schemaType, import_lodash.default.includes(schemaDefinition.required || [], key2))
        });
      });
    });
    import_lodash.default.forEach(subSchemas, ([key, subSchema]) => {
      const subSchemaType = subSchema.type === "array" ? [traverseDefinitions(subSchema.items)] : traverseDefinitions(subSchema);
      const validate = genArrayLimit(subSchema.minItems, subSchema.maxItems);
      schema.add({
        [key]: {
          type: subSchemaType,
          required: import_lodash.default.includes(schemaDefinition.required || [], key),
          validate
        }
      });
    });
    return schema;
  }
  if (schemaDefinition.type === "array") {
    schema.add({
      type: traverseDefinitions(schemaDefinition.items)
    });
    return schema;
  }
  return typeHandler(schemaDefinition, false);
};
var jsonSchemaToMongooseSchema = (jsonSchema, definitionKey) => {
  if (!/draft-(0[4-9]|[1-9][0-9])/.test(import_lodash.default.get(jsonSchema, "$schema", "draft-00"))) {
    throw new Error("Invalid JSON Schema, expected $schema to be draft-04 or greater");
  }
  const definitions = jsonSchema.definitions;
  if (import_lodash.default.isPlainObject(definitions) && definitions.hasOwnProperty(definitionKey)) {
    const schema = traverseDefinitions(definitions, definitionKey);
    return schema;
  }
  throw new Error("Invalid JSON Schema");
};
var src_default = jsonSchemaToMongooseSchema;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  genArrayLimit,
  handleProperty,
  processAnyOf,
  schemaTypeMap,
  traverseDefinitions,
  typeHandler,
  version
});
//# sourceMappingURL=json-schema-to-mongoose-schema.js.map
'undefined'!=typeof module&&(module.exports=jsonSchemaToMongooseSchema),'undefined'!=typeof window&&(jsonSchemaToMongooseSchema=jsonSchemaToMongooseSchema);