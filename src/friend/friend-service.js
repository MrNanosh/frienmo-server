const FriendService = {
    async getFriends(db, user_id) {
        //get all the instances in friend table where the user_is is user_id
        const result = await db.select('*').from('friend').where({ user_id })
        //get all the instances in friend table where the friend_id is user_id
        const friends = await db.select('*').from('friend').where('friend_id', user_id)
        let resolution = [];
        
        //make sure both end consider each other friends
        for (let i = 0; i < result.length; i++) {
            if (result[i].accepted && friends[i].accepted) {
                //if they are friends add it to the output array
                resolution.push(result[i]);
                //console.log("resolution",resolution)
            }
        }
        let answer = [];
        for (let i = 0; i < resolution.length; i++) {
            await db.select('id', 'fav_accepted', 'fav_requested', 'username', 'name', 'description')
            .from('user').where('id', resolution[i].friend_id).first()
                .then(friend => {
                    answer.push(friend);
                    console.log("ans",answer)
                })
        }
        console.log("return answer",answer)
        return answer;
    },
    makeFriend(db, friend, friend2) {
        return db.insert(friend2).into('friend').returning('*').then(() => {
            return db.insert(friend).into('friend').returning('*').then(rows => {
                return rows[0]
            });
        });
    },
    //returns the friendship if it exists, otherwise returns false
    getFriendRequestById(db, user_id, friend_id) {
        return db.select('*').from('friend').where({ user_id })
            .then(res => {
                let result = false
                for (let i = 0; i < res.length; i++) {
                    if (res[i].friend_id === friend_id) {
                        return result = res[i];
                    }
                }
                return result;
            })
    },
    confirmFriend(db, user_id, friend_id) {
        return db('friend').where('user_id', user_id).andWhere('friend_id', friend_id).update({
            accepted: true
        }, ['user_id', 'friend_id', 'accepted']);
    },
    deleteFriend(db, user_id, friend_id) {
        return db('friend').where('user_id', user_id).andWhere('friend_id', friend_id).del()
            .then(() => {
                return db('friend').where('user_id', friend_id).andWhere('friend_id', user_id).del()
            })
    },
    async getFriendRequests(db, user_id){
        let requests = await db.select('*').from('friend').where({user_id}).andWhere('accepted', false);
        let answer = [];
        for (let i = 0; i < requests.length; i++) {
            await db.select('id', 'fav_accepted', 'fav_requested', 'username', 'name', 'description')
            .from('user').where('id', requests[i].friend_id).first()
                .then(friend => {
                    answer.push(friend);
                })
        }
        return answer;
    }
}

module.exports = FriendService;