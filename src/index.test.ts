import _ from 'lodash';

import jsonSchemaToMongooseSchema from './';

const userSchema = require('../__fixtures__/User.json');

describe('Function jsonSchemaToMongooseSchema', () => {
  it('verifies JSON schema version', () => {
    expect(() => {
      jsonSchemaToMongooseSchema({
        $schema: 'http://json-schema.org/draft-03/schema#',
        definitions: {}
      }, 'Test')
    }).toThrow(
      'Invalid JSON Schema, expected $schema to be draft-04 or greater',
    );
  });

  it('transforms JSON schema to Mongoose schema', async () => {
    const result = jsonSchemaToMongooseSchema(userSchema, 'User');

    // console.dir(_.get(result, 'paths.emails.options.validate'), {depth: null});

    expect(result).toBeDefined();
    expect(_.get(result, 'paths.abilities.instance')).toBe('Embedded');
    expect(_.get(result, 'paths.abilities.options.required')).toBe(true);
    expect(_.get(result, 'paths.abilities.schema.paths.permissions.instance')).toBe('Array');
    expect(_.get(result, 'paths.abilities.schema.paths.permissions.options.required')).toBe(true);
    expect(_.get(result, 'paths.abilities.schema.paths.restrictions.instance')).toBe('Array');
    expect(_.get(result, 'paths.abilities.schema.paths.restrictions.options.required')).toBe(true);
    expect(_.get(result, 'paths.additionalName.instance')).toBe('String');
    expect(
      _.get(result, 'paths.additionalName.options.match')
    ).toBe(
      userSchema.definitions.User.properties.additionalName.pattern
    );
    expect(_.get(result, 'paths.addresses.instance')).toBe('Array');
    expect(_.get(result, 'paths.addresses.options.required')).toBe(true);
    expect(_.get(result, 'paths.addresses.schema.paths.stellarBody.instance')).toBe('Embedded');
    expect(_.get(result, 'paths.addresses.schema.paths.stellarBody.options.required')).toBe(false);
    expect(_.get(result, 'paths.addresses.schema.paths.country.instance')).toBe('String');
    expect(
      _.get(result, 'paths.addresses.schema.paths.country.options.enum', []).join('')
    ).toBe(
      userSchema.definitions.User.properties.addresses.items.properties.country.enum.join('')
    );
    expect(_.get(result, 'paths.birthDate.instance')).toBe('Date');
    expect(
      _.get(result, 'paths.emails.options.validate[0]')([])
    ).toBe(false);
    expect(
      _.get(result, 'paths.emails.options.validate[0]')([1])
    ).toBe(true);
    expect(
      _.get(result, 'paths.emails.options.validate[0]')([1, 2])
    ).toBe(true);
  });
});
