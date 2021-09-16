'use strict'
const Book = use("App/Models/Book")
const Story = use("App/Models/Story")
const like = use("App/Models/Like")
const Comment = use("App/Models/Comment")

class BookController {
    async create({request, response, params, auth}){
        try{
            if( !request.input("isbn") || !request.input('name') || !/^[a-z]+\/[a-z]+$/.test(request.input('loacation')) || !request.input('current_location') || !request.input('description') || !request.input('author') ){
                return response.status(400)
            }
            const user = await auth.getUser()
            const book = new Book
            book.name = request.input('name')
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
            book.rates = 0
            book.save()
            const story = new Story
            story.book_id = await book.id
            story.journeys = 0
            story.save()
            return response.status(200).json({book: book, story: story})
        }catch(e){
            return response.status(500)
        }
    }
    async rate({request, response, params, auth}){
        try{
            if( !request.input('rating') || typeof request.input('rating') != 'int' ||  request.input('rating') < 0 || request.input('rating') > 10 ){
                return response.status(400)
            }
            const book = await Book.findOrFail(params.book_id)
            if( !book ){ return response.status(400) }
            book.rating = (book.rating * book.rates + request.input('rating')) / (book.rates + 1)
            book.rates++
            book.save()
            if( book.rating < 0 || book.rating > 10){ throw new Error }
        }catch(e){
            return response.status(500)
        }
    }
    async like({request, response, params, auth}){
        try{
            const like = new Like       
            const user = await auth.getUser()
            like.user_id = user.id
            like.book_id = params.book_id
            like.type = params.like_type
            like.save()
            return response.status(200)
        }catch(e){
            return response.status(500)
        }
    }
    async comment([request, response, params, auht]){
        try{
            const comment = new Comment
            const user = await auth.getUser()
            comment.book_id = params.book_id
            comment.user_id = user.id
            if( !request.input('comment_text') ){
                return reespones.status(400)
            }
            comment.text = request.input('text')
            if( params.replying_to ){
                comment.replying_to = params.replyed_comment_id
            }
            comment.save()
            return response.status(200)
        }catch(e){
            return response.status(500)
        }
    }

    async show_single_book({request, response, params, auth}){
        try{
            const book = await Book.findOrFail(params.book_id)
            if( !book ){ return response.status(400) }
            const likes = await Like.query().where('book_id',params.book_id).fetch()
            const comments = await Comment.query().where('book_id',params.id).fetch()
            return response.status(200).json({book: book, like: likes, comments: comments})
        }catch(e){
            return response.status(500)
        }
    }
    async show_all_of_books({request, response, params, auth}){
        try{
            const books = await Book.all()
            return response.status(200).json({books: books})
        }catch(e){
            return response.status(500)
        }
    }
    async add_to_reading_books({request, response, params, auth}){
        try{
            const user = await auth.getUser()
            const book = await Book.findOrFail(params.book_id)
            if( !book ){ return response.status(400) }
            if( !request.input('isbn') || request.input('isbn') != book.isbn ){ return response.status(401) }
            let reading_books = user.reading_books
            reading_books += "," + book.id
            user.reading_books = reading_books 
            user.save()
            return response.status(200)
        }catch(e){
            return response.status(500)
        }
    }
    async add_to_read_list({request, response, params, auth}){
        try{
            const book = await Book.findOrFail(params.book_id)
            const user = await auth.getUser()
            if( !book ){return response.status(404) }
            const reading_books = user.reading_books.split(',')
            if( !reading_books.includes(book.id) ){ return response.status(400) }
            const read_books = user.read_books
            read_books += ',' + book.id
            user.read_books = read_books
            user.save()
            return response.status(200)
        }catch(e){
            return response.status(500)
        }
    }
    async mark_book({request, response, params, auth}){
        try{
            const user = await auth.getUser()
            const book = await Book.findOrFail(params.books_id)
            if( !book ){ return response.status(404) }
            const marked_books = user.marked_books
            marked_books += ',' + book.id
            user.marked_books = marked_books 
            user.save()
            return response.status(200)
        }catch(e){
            return response.status(500)
        }
    }
    async remove_from_reading_list({request, response, params, auth}){
        try{
            const user = await auth.getUser()
            const book = await Book.findOrFail(params.book_id)
            if( !book ){ return response.status(404) }
            const reading_list = user.reading_list.split(',')

        }catch(e){

        }
    }
    async remove_from_read_list({}){}
    async move_to_read_list({}){} // From reading list ofcourse
    async show_my_books({}){} // Show the added, reading, read and marked books of user
    async search_books({}){} // search for a specific book
}

module.exports = BookController
