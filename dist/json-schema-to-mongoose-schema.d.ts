import { Schema, SchemaDefinitionProperty } from 'mongoose';
export { version } from '../package.json';
export declare const schemaTypeMap: {
    string: StringConstructor;
    boolean: BooleanConstructor;
    number: NumberConstructor;
    integer: NumberConstructor;
};
export interface JsonSchemaBaseType {
    type: keyof typeof schemaTypeMap;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    enum?: string[];
    format?: string;
}
export interface JsonSchemaArrayType {
    type: 'array';
    minItems?: number;
    maxItems?: number;
    items: JsonSchemaValidTypes | JsonSchemaAnyOfType;
}
export interface JsonSchemaObjectType {
    type: 'object';
    properties: {
        [k: string | symbol]: JsonSchemaValidTypes | JsonSchemaAnyOfType;
    };
    required?: string[];
}
export declare type JsonSchemaValidTypes = JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType;
export interface JsonSchemaAnyOfType {
    anyOf: JsonSchemaObjectType[];
}
export interface JsonSchema {
    $schema: string;
    definitions: {
        [k: string | symbol]: JsonSchemaObjectType;
    };
}
export declare type Validation = [((val: any[]) => boolean), string] | [];
export declare const genArrayLimit: (minItems?: number | undefined, maxItems?: number | undefined) => Validation;
export declare const typeHandler: (schemaType: JsonSchemaBaseType, required?: boolean | undefined) => {
    type: StringConstructor | BooleanConstructor | NumberConstructor | DateConstructor;
    match: RegExp;
    minLength: number | undefined;
    maxLength: number | undefined;
    min: number | undefined;
    max: number | undefined;
    enum: string[] | undefined;
    required: boolean | undefined;
};
export declare const processAnyOf: (property: JsonSchemaAnyOfType) => JsonSchemaObjectType;
export declare const handleProperty: (key: string, property: JsonSchemaBaseType | JsonSchemaObjectType | JsonSchemaArrayType | JsonSchemaAnyOfType, subSchemaHandler: (key: string, subSchema: JsonSchemaObjectType | JsonSchemaArrayType, required?: string[] | undefined) => void, subTypeHandler: (key: string, schemaType: JsonSchemaBaseType) => void) => void;
export declare const traverseDefinitions: (definitions: JsonSchema['definitions'] | JsonSchemaValidTypes | JsonSchemaAnyOfType, definitionKey?: string | undefined) => string | Function | Schema<any, import("mongoose").Model<any, any, any, any>, {}> | Schema<any, any, any>[] | Function[] | import("mongoose").SchemaTypeOptions<any> | import("mongoose").SchemaTypeOptions<any>[] | {
    [x: string]: SchemaDefinitionProperty<any> | undefined;
} | ({
    [path: string]: SchemaDefinitionProperty<undefined>;
} | {
    [x: string]: SchemaDefinitionProperty<any> | undefined;
})[];
declare const jsonSchemaToMongooseSchema: (jsonSchema: JsonSchema, definitionKey: string) => Schema<any, import("mongoose").Model<any, any, any, any>, {}>;
export default jsonSchemaToMongooseSchema;
