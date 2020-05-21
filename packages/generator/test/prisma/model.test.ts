import {Model} from '../../src/prisma/model'
import {Field} from '../../src/prisma/field'

describe('Prisma Model', () => {
  it('generates a proper model', () => {
    expect(
      new Model(
        'user',
        [
          new Field('id', {
            type: 'Int',
            isId: true,
            default: {name: 'autoincrement'},
          }),
          Field.parse('email:string:unique'),
          Field.parse('updated:dateTime:updatedAt'),
          Field.parse('recentLogins:dateTime[]'),
          Field.parse('twoFactorEnabled:boolean'),
          Field.parse('twoFactorMethod:string?'),
        ].flat(),
      ).toString(),
    ).toMatchSnapshot()
  })
})
