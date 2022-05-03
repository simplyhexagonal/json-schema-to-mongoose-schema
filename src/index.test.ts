import _ from 'lodash';

import jsonSchemaToMongooseSchema from './';

const userSchema = require('../__fixtures__/User.json');
const creativeWorkSchema = require('../__fixtures__/CreativeWork.json');

describe('Function jsonSchemaToMongooseSchema', () => {
  // it('works', () => {
  //   const result = jsonSchemaToMongooseSchema(groupSchema, 'Group');

  //   console.dir(result, { depth: null });
  // });
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
    const userResult = jsonSchemaToMongooseSchema(userSchema, 'User');

    // console.dir(_.get(userResult, 'paths.emails.options.validate'), {depth: null});

    expect(userResult).toBeDefined();
    expect(_.get(userResult, 'paths.abilities.instance')).toBe('Embedded');
    expect(_.get(userResult, 'paths.abilities.options.required')).toBe(true);
    expect(_.get(userResult, 'paths.abilities.schema.paths.permissions.instance')).toBe('Array');
    expect(_.get(userResult, 'paths.abilities.schema.paths.permissions.options.required')).toBe(true);
    expect(_.get(userResult, 'paths.abilities.schema.paths.restrictions.instance')).toBe('Array');
    expect(_.get(userResult, 'paths.abilities.schema.paths.restrictions.options.required')).toBe(true);
    expect(_.get(userResult, 'paths.additionalName.instance')).toBe('String');
    expect(
      _.get(userResult, 'paths.additionalName.options.match')
    ).toMatchObject(
      new RegExp(userSchema.definitions.User.properties.additionalName.pattern)
    );
    expect(_.get(userResult, 'paths.addresses.instance')).toBe('Array');
    expect(_.get(userResult, 'paths.addresses.options.required')).toBe(true);
    expect(_.get(userResult, 'paths.addresses.schema.paths.stellarBody.instance')).toBe('Embedded');
    expect(_.get(userResult, 'paths.addresses.schema.paths.stellarBody.options.required')).toBe(false);
    expect(_.get(userResult, 'paths.addresses.schema.paths.country.instance')).toBe('String');
    expect(
      _.get(userResult, 'paths.addresses.schema.paths.country.options.enum', []).join('')
    ).toBe(
      userSchema.definitions.User.properties.addresses.items.properties.country.enum.join('')
    );
    expect(_.get(userResult, 'paths.birthDate.instance')).toBe('Date');
    expect(
      _.get(userResult, 'paths.emails.options.validate[0]')([])
    ).toBe(false);
    expect(
      _.get(userResult, 'paths.emails.options.validate[0]')([1])
    ).toBe(true);
    expect(
      _.get(userResult, 'paths.emails.options.validate[0]')([1, 2])
    ).toBe(true);

    const creativeWorkResult = jsonSchemaToMongooseSchema(creativeWorkSchema, 'CreativeWork');

    expect(creativeWorkResult).toBeDefined();
    expect(_.get(creativeWorkResult, 'paths.authors.instance')).toBe('Array');
    expect(_.get(creativeWorkResult, 'paths.authors.options.required')).toBe(true);
    expect(_.get(creativeWorkResult, 'paths.authors.schema.paths.givenName.instance')).toBe('String');
    expect(_.get(creativeWorkResult, 'paths.authors.schema.paths.addresses.options.required')).toBe(true);
    expect(_.get(creativeWorkResult, 'paths.dimensions.schema.paths.depth.instance')).toBe('Embedded');
    expect(
      _.get(
        creativeWorkResult,
        'paths.dimensions.schema.paths.depth.schema.paths.name.enumValues',
        [],
      ).includes('meter')
    ).toBe(true);
    expect(
      _.get(
        creativeWorkResult,
        'paths.dimensions.schema.paths.depth.schema.paths.name.enumValues',
        [],
      ).includes('millimeter')
    ).toBe(true);
  });
});
