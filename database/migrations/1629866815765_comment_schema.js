'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentSchema extends Schema {
  up () {
    this.create('comments', (table) => {
      table.increments()
      table.integer('journey_id')
      table.foreign('journey_id').references('journeis.id').onDelete('CASCADE')
      table.integer('book_id')
      table.foreign('book_id').references('books.id').onDelete('CASCADE')
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
      table.text('text','long text')
      table.foreign('replying_to').references('comments.id').onDelete('CASCADE').nullabel()
      table.timestamps()
    })
  }

  down () {
    this.drop('comments')
  }
}

module.exports = CommentSchema
