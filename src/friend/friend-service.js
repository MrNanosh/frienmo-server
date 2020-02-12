const FriendService = {
    getFriends(db, user_id){
        //get all the instances in friend tabel where the user_is is user_id
        return db.select('*').from('friend').where({user_id})
        .then(res =>{
            const result = res
            //get all the instances in friend tabel where the friend_id is user_id
            return db.select('*').from('friend').where('friend_id', user_id)
            .then(friends =>{
                let resolution = [];
                //make sure both end consider each other friends
                for(let i =0; i < result.length; i++){
                    if(result[i].accepted && friends[i].accepted){
                        //if they are friends add it to the output array
                        resolution.push(result[i]);
                    }
                }
                return resolution;
            })
            
        })
    },
    makeFriend(db, user_id, friend_id){

    },
    confirmFriend(db, user_id, friend_id){

    },
    deleteFriend(db, user_id, friend_id){
        
    }
}

module.exports = FriendService;