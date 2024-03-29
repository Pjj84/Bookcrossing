'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 254).notNullable().unique()
      table.string('first_name',30).notNullable()
      table.string('last_name',30).notNullable()
      table.enum("role",['normal','admin']), { useNative: true, enumName: 'user_role'}
      table.enum('visibility',['private','public']), { useNative: true,enumName: 'user_visibilty'}
      table.string('bio',120)
      table.string('profile').defaultTo('default.jpg')
      table.string('reading_books') // Should be array like
      table.string('read_books') // Should be array like
      table.string('marked_books') // Should be array like
      table.string('suggested_books') // Should be array like
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
