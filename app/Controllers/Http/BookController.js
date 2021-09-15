'use strict'
const Book = use("App/Models/Book")

class BookController {
    async create({request, response, params, auth}){
        try{
            if( !request.input("isbn") || !request.input('name') || !/^[a-z]+\/[a-z]+$/.test(request.input('loacation')) )
            const user = auth.getUser()
            const book = new Book
            book.name = 
            book.owner_id = user.id
            book.current_location = request.input('location')
            book.description = request.input('description')
            book.author = request.input('author')
            if(request.file('cover_image', {type: 'image',size: '2mb'})){
                const cover_image = request.file('cover_image', {types: ['image'],size: '2mb'})
                const date = new Date
                date = date.toISOString()
                await cover_image.move(Helpers.tmpPath('coverImages'), { name:  date, overwrite: true})
                book.cover_image = date
            }
            book.status = "pending"
            book.save()
            return response.status(200).json({book: book})
        }catch(e){
            return response.status(500)
        }
    }
}

module.exports = BookController
