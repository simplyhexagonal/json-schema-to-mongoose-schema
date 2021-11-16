# JSON Schema to Mongoose Schema
![Tests](https://github.com/simplyhexagonal/json-schema-to-mongoose-schema/workflows/tests/badge.svg)

This package was inspired by [convert-json-schema-to-mongoose](https://github.com/kristianmandrup/convert-json-schema-to-mongoose), but it's a bit more flexible and addresses the following:

- ability to parse JSON schemas that are greater than [JSON-Schema draft-04](https://tools.ietf.org/html/draft-04)
- parses sub-schemas into their own nested `Schema` instances to avoid required properties in them to cause false validation errors on their optional parents
- fully type-safe
- thoroughly tested

We use this project along [typescript-json-schema](https://github.com/YousefED/typescript-json-schema) to have our Typescript interfaces be the single
source of truth that generate both the JSON schema and Mongoose schema for each entity
within our apps.

## Open source notice

This project is open to updates by its users, [I](https://github.com/jeanlescure) ensure that PRs are relevant to the community.
In other words, if you find a bug or want a new feature, please help us by becoming one of the
[contributors](#contributors-) ✌️ ! See the [contributing section](#contributing)

## Like this module? ❤

Please consider:

- [Buying me a coffee](https://www.buymeacoffee.com/jeanlescure) ☕
- Supporting Simply Hexagonal on [Open Collective](https://opencollective.com/simplyhexagonal) 🏆
- Starring this repo on [Github](https://github.com/simplyhexagonal/json-schema-to-mongoose-schema) 🌟

## Install

_(Note: this package depends on lodash and mongoose)_

```sh
pnpm i lodash mongoose @simplyhexagonal/json-schema-to-mongoose-schema

# or
yarn add lodash mongoose @simplyhexagonal/json-schema-to-mongoose-schema

# or
npm install lodash mongoose @simplyhexagonal/json-schema-to-mongoose-schema
```

## Usage

```ts
import jsonSchemaToMongooseSchema from '@simplyhexagonal/json-schema-to-mongoose-schema';

const userSchema = require('./schemas/User.json');
// {
//   "$schema": "http://json-schema.org/draft-07/schema#",
//   "definitions": {
//     "User": {
//       ...
//     }
//   }
// }

const mongooseSchema = jsonSchemaToMongooseSchema(userSchema, 'User');

// Then simply use your newly generated mongoose schema
const model = await mongoose.model(modelName, mongooseSchema);
```

## Contributing

Yes, thank you! This plugin is community-driven, most of its features are from different authors.
Please update the docs and tests and add your name to the `package.json` file.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://jeanlescure.cr"><img src="https://avatars2.githubusercontent.com/u/3330339?v=4" width="100px;" alt=""/><br /><sub><b>Jean Lescure</b></sub></a><br /><a href="#maintenance-jeanlescure" title="Maintenance">🚧</a> <a href="https://github.com/simplyhexagonal/json-schema-to-mongoose-schema/commits?author=jeanlescure" title="Code">💻</a> <a href="#userTesting-jeanlescure" title="User Testing">📓</a> <a href="https://github.com/simplyhexagonal/json-schema-to-mongoose-schema/commits?author=jeanlescure" title="Tests">⚠️</a> <a href="#example-jeanlescure" title="Examples">💡</a> <a href="https://github.com/simplyhexagonal/json-schema-to-mongoose-schema/commits?author=jeanlescure" title="Documentation">📖</a></td>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
## License

Copyright (c) 2021-Present [JSON Schema to Mongoose Schema Contributors](https://github.com/simplyhexagonal/json-schema-to-mongoose-schema/#contributors-).<br/>
Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
