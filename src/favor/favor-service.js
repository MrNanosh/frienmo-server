const xss = require('xss');
const FavorService = {
  insertFavor(db, newFavor) {
    return db
      .insert(newFavor)
      .into('favor')
      .returning('*');
  },
  serializeFavor(favor) {
    return {
      creator_id: favor.creator_id,
      title: xss(favor.title),
      category: favor.category,
      publicity: favor.publicity,
      description: xss(
        favor.description
      ),
      user_location: xss(
        favor.user_location
      ),
      tags: xss(favor.tags),
      limit: favor.limit
    };
  },
  getAllFavors(
    db,
    productsPerPage,
    page
  ) {
    const offset =
      productsPerPage * (page - 1);
    return db('outstanding as o')
      .join(
        'favor as fa',
        'fa.id',
        '=',
        'o.favor_id'
      )
      .join(
        'user as creator',
        'creator.id',
        '=',
        'fa.creator_id'
      )
      .where(
        'fa.publicity',
        '=',
        'public'
      )
      .leftOuterJoin(
        'user as receiver',
        'receiver.id',
        '=',
        'o.receiver_id'
      )
      .leftOuterJoin(
        'user as issuer',
        'issuer.id',
        '=',
        'o.users_id'
      )
      .orderBy('posted', 'desc')
      .select(
        'fa.*',
        'o.id as outstanding_id',
        'o.receiver_redeemed as receiver_redeemed',
        'o.giver_redeemed as issuer_redeemed',
        'creator.id as creator_id',
        'creator.name as creator_name',
        'creator.username as creator_username',
        'issuer.id as issuer_id',
        'issuer.name as issuer_name',
        'issuer.username as issuer_username',
        'receiver.id as receiver_id',
        'receiver.name as receiver_name',
        'receiver.username as receiver_username'
      )
  },
  getFavorById(db, id) {

    return db('outstanding as o')
      .join(
        'favor as fa',
        'fa.id',
        '=',
        'o.favor_id'
      )
      .join(
        'user as creator',
        'creator.id',
        '=',
        'fa.creator_id'
      )
      .where('fa.id', '=', id)
      .leftOuterJoin(
        'user as receiver',
        'receiver.id',
        '=',
        'o.receiver_id'
      )
      .leftOuterJoin(
        'user as issuer',
        'o.users_id',
        '=',
        'issuer.id'
      )
      .select(
        'fa.*',
        'o.id as outstanding_id',
        'o.receiver_redeemed as receiver_redeemed',
        'o.giver_redeemed as issuer_redeemed',
        'creator.id as creator_id',
        'creator.name as creator_name',
        'creator.username as creator_username',
        'issuer.id as issuer_id',
        'issuer.name as issuer_name',
        'issuer.username as issuer_username',
        'receiver.id as receiver_id',
        'receiver.name as receiver_name',
        'receiver.username as receiver_username'
      );
  },
  getFavorByFriends(
    db,
    user_id,
    productsPerPage,
    page
  ) {
    //excludes personal
    const offset =
      productsPerPage * (page - 1);
    function friends(fr, o) {
      return db('outstanding as o')
        .join(
          'favor as fa',
          'fa.id',
          '=',
          'o.favor_id'
        )
        .join(
          'user as creator',
          'creator.id',
          '=',
          'fa.creator_id'
        )
        .where(
          'fa.publicity',
          '=',
          'friend'
        )
        .leftOuterJoin(
          'friend as fr',
          fr,
          '=',
          o
        )
        .where(function () {
          this.where(
            'fr.user_id',
            '=',
            user_id
          ).orWhere(
            'fr.friend_id',
            '=',
            user_id
          );
        })
        .leftOuterJoin(
          'user as receiver',
          'receiver.id',
          '=',
          'o.receiver_id'
        )
        .leftOuterJoin(
          'user as issuer',
          'o.users_id',
          '=',
          'issuer.id'
        )
        .select(
          'fa.id as favor_id',
          'fa.title as title',
          'fa.description as description',
          'fa.category as category',
          'fa.expiration_date as expiration_date',
          'fa.publicity as publicity',
          'fa.user_location as user_location',
          'fa.tags as tags',
          'fa.limit as limit',
          'o.id as outstanding_id',
          'o.receiver_redeemed as receiver_redeemed',
          'o.giver_redeemed as issuer_redeemed',
          'creator.id as creator_id',
          'creator.name as creator_name',
          'creator.username as creator_username',
          'issuer.id as issuer_id',
          'issuer.name as issuer_name',
          'issuer.username as issuer_username',
          'receiver.id as receiver_id',
          'receiver.name as receiver_name',
          'receiver.username as receiver_username'
        );
    }

    return friends(
      'fr.friend_id',
      'o.users_id'
    )
      .union([
        friends(
          'fr.user_id',
          'o.users_id'
        ),
        friends(
          'fr.user_id',
          'o.users_id'
        ),
        friends(
          'fr.friend_id',
          'o.users_id'
        )
      ])
  },
  getPersonalFavors(
    db,
    user_id,
    productsPerPage,
    page
  ) {
    const offset =
      productsPerPage * (page - 1);
    return (
      db('outstanding as o')
        .join(
          'favor as fa',
          'fa.id',
          '=',
          'o.favor_id'
        )
        .join(
          'user as creator',
          'creator.id',
          '=',
          'fa.creator_id'
        )
        .where(
          'fa.publicity',
          '=',
          'dm'
        )
        .leftOuterJoin(
          'user as receiver',
          'receiver.id',
          '=',
          'o.receiver_id'
        )
        .leftOuterJoin(
          'user as issuer',
          'o.users_id',
          '=',
          'issuer.id'
        )
        .where(function () {
          this.where(
            'fa.creator_id',
            '=',
            user_id
          )
            .orWhere(
              'issuer.id',
              '=',
              user_id
            )
            .orWhere(
              'receiver.id',
              '=',
              user_id
            );
        })
        .select(
          'fa.id as favor_id',
          'fa.title as title',
          'fa.description as description',
          'fa.category as category',
          'fa.expiration_date as expiration_date',
          'fa.publicity as publicity',
          'fa.user_location as user_location',
          'fa.tags as tags',
          'fa.limit as limit',
          'o.id as outstanding_id',
          'o.receiver_redeemed as receiver_redeemed',
          'o.giver_redeemed as issuer_redeemed',
          'creator.id as creator_id',
          'creator.name as creator_name',
          'creator.username as creator_username',
          'issuer.id as issuer_id',
          'issuer.name as issuer_name',
          'issuer.username as issuer_username',
          'receiver.id as receiver_id',
          'receiver.name as receiver_name',
          'receiver.username as receiver_username'
        )
    );
  },
  updateFavor(db, id, newFavorFields) {
    return db('favor')
      .where({ id })
      .update(newFavorFields);
  },
  deleteFavor(db, id) {
    return db('favor')
      .where({ id })
      .delete();
  },
  getOutstanding(db, favor_id) {
    return db('outstanding')
      .where({
        favor_id
      })
      .select('*');
  },
  getOutstandingById(
    db,
    outstanding_id
  ) {
    return db('outstanding as o')
      .where(
        'o.id',
        '=',
        outstanding_id
      )
      .join(
        'favor as fa',
        'fa.id',
        '=',
        'o.favor_id'
      )
      .join(
        'user as creator',
        'creator.id',
        '=',
        'fa.creator_id'
      )
      .leftOuterJoin(
        'user as receiver',
        'receiver.id',
        '=',
        'o.receiver_id'
      )
      .leftOuterJoin(
        'user as issuer',
        'o.users_id',
        '=',
        'issuer.id'
      )
      .select(
        'fa.*',
        'o.id as outstanding_id',
        'o.receiver_redeemed as receiver_redeemed',
        'o.giver_redeemed as issuer_redeemed',
        'creator.id as creator_id',
        'creator.name as creator_name',
        'creator.username as creator_username',
        'issuer.id as issuer_id',
        'issuer.name as issuer_name',
        'issuer.username as issuer_username',
        'receiver.id as receiver_id',
        'receiver.name as receiver_name',
        'receiver.username as receiver_username'
      )
      .first();
  },
  redeem(
    db,
    outstanding_id,
    confirmation
  ) {
    return db('outstanding')
      .where({ id: outstanding_id })
      .update(confirmation);
  },
  insertOutstanding(
    db,
    newOutstanding
  ) {
    return db
      .insert(newOutstanding)
      .into('outstanding')
      .returning('*');

  },
  getPublicFavors(
    db,
    user_id,
    productsPerPage,
    page
  ) {
    const offset =
      productsPerPage * (page - 1);
    return (
      db('outstanding as o')
        .join('favor as fa', 'fa.id', '=', 'o.favor_id')
        .join('user as creator', 'creator.id', '=', 'fa.creator_id')
        .where('fa.publicity', '=', 'public')
        .leftOuterJoin('user as receiver', 'receiver.id', '=', 'o.receiver_id')
        .leftOuterJoin('user as issuer', 'o.users_id', '=', 'issuer.id')
        .where(function () {
          this.where('fa.creator_id', '=', user_id)
            .orWhere('issuer.id', '=', user_id)
            .orWhere('receiver.id', '=', user_id);
        })
        .orderBy('posted', 'desc')
        .select(
          'fa.id as favor_id',
          'fa.title as title',
          'fa.description as description',
          'fa.category as category',
          'fa.expiration_date as expiration_date',
          'fa.publicity as publicity',
          'fa.user_location as user_location',
          'fa.tags as tags',
          'fa.limit as limit',
          'o.id as outstanding_id',
          'o.receiver_redeemed as receiver_redeemed',
          'o.giver_redeemed as issuer_redeemed',
          'creator.id as creator_id',
          'creator.name as creator_name',
          'creator.username as creator_username',
          'issuer.id as issuer_id',
          'issuer.name as issuer_name',
          'issuer.username as issuer_username',
          'receiver.id as receiver_id',
          'receiver.name as receiver_name',
          'receiver.username as receiver_username'
        )
    );
  },
  updateOutstanding(
    db,
    outstanding_id,
    receiver_id,
    users_id
  ) {
    return db('outstanding')
      .where('id', outstanding_id)
      .update({
        receiver_id,
        users_id
      });
  },
  favorFilter(favors, user, filter) {
    let result;
    //console.log('asldkfja;lskdfj', favors, filter);
    if (!filter || !user) {
      return favors;
    } else {
      switch (filter) {
        case 'received':
          result = favors.filter(favor => favor.receiver_id === user.id);
          return result;
        case 'issued':
          result = favors.filter(favor => favor.user_id === user.id);
          return result;
        case 'redeemed':
          result = favors.filter(favor =>  favor.user_id === user.id && favor.receiver_redeemed)
          return result;
        default:
          return favors;
      }
    }
  }
};

module.exports = FavorService;
