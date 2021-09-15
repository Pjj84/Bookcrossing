'use strict'
const User = use("App/Models/User");
const Axios = use("Axios");
const Helpers = use("Helpers");

class UserController {
    async Login({request, response, auth}){
        try{
            await auth.check()
            return response.status(200).json({user: auth.getUser()})
        }catch(error){
            const api_token = request.header('api_token')
            await Axios.post('url',{ token: api_token }).then((res) => {
            if(res.status == 200){
                const authenticated_user = res.user
                let user = await User.query().where('email',authenticated_user.email).first()
                if(!user){
                    let user = new User
                    user.email = authenticated_user.email
                    user.password = authenticated_user.password
                    user.role = authenticated_user.role // The role of the user may be specified in a different way
                    user.save()
                    const token = await auth.generate(user)
                    return response.status(200).json({token: token, user: user})
                }else{
                    if(user.first_name != authenticated_user.first_name && user.last_name != authenticated_user.last_name){
                        user.first_name = authenticated_user.first_name
                        user.last_name = authenticated_user.last_name
                        user.save()
                    }
                    const token = await auth.generate(user)
                    return response.status(200).json({token: token, user: user})
                }
            }else if(res.status == 401){
                    return response.status(401)
            }else{
                return response.status(400)
            }

            }).catch((error) => {
                return response.status(500).json({ error: error })
            })
        }
    }
    async Edit({request, response , params}){
        try{
            const user = await User.find(params.id)
            user.visibilty = request.input('visibilty') || user.visibilty
            user.bio = request.input('bio') || user.bio
            if(request.file('pic', {type: 'image',size: '2mb'})){
                const pic = request.file('pic', {types: ['image'],size: '2mb'})
                await pic.move(Helpers.tmpPath('profileImages'), { name: user.email.substring(0,user.email.indexOf('@')) , overwrite: true})
                user.profile = user.email.substring(0,user.email.indexOf('@'))
            }
            user.profile = request.input('profile')
            if(request.input('first_name') || request.input('last_name')){
                user.first_name = request.input('first_name') || user.first_name
                user.last_name = request.input('last_name') || user.last_name
                await Axios.post('url',{ first_name: user.first_name, last_name: user.last_name}).catch((error) => {
                    return response.status(500).json({ error: error })
                })
                return response.status(200)
            }
            return response.status(200)
        }catch(e){
            return response.status(404)
        }
    }
}

module.exports = UserController
