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
    makeFriend(db, friend, friend2){
        return db.insert(friend2).into('friend').returning('*').then(() =>{
            return db.insert(friend).into('friend').returning('*').then(rows =>{
                return rows[0]
            });
        });
    },
    //returns a boolean, true if the friend exists and is unaccepted, 
    //false if it is accepted, null if the friend doesnt exist
    getFriendRequestById(db, user_id, friend_id){
        return db.select('*').from('friend').where({user_id})
        .then(res =>{
            let result = false
            for(let i =0; i < res.length; i++){
                if(res[i].friend_id === friend_id){
                    if(!res[i].accepted){
                        return result = true;
                    }
                }
            }
            return result;
        })
    },
    confirmFriend(db, user_id, friend_id){
        return db('friend').where('user_id', user_id).andWhere('friend_id', friend_id).update({
            accepted: true
        }, ['user_id', 'friend_id', 'accepted']);
    },
    deleteFriend(db, user_id, friend_id){

    }
}

module.exports = FriendService;