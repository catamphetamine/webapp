import { MongoClient, ObjectId } from 'mongodb'

Promise.promisifyAll(MongoClient)

export default class MongoDB
{
	collections = {}

	constructor()
	{
		this.ObjectId = ObjectId
	}

	async connect()
	{
		this.db = await MongoClient.connect(`mongodb://${configuration.mongodb.user}:${configuration.mongodb.password}@${configuration.mongodb.host}:${configuration.mongodb.port}/${configuration.mongodb.database}`,
		{
			// https://docs.mongodb.org/manual/reference/write-concern/
			db: { w: 'majority' } 
		})
	}

	collection(name)
	{
		let collection = this.collections[name]

		if (!collection)
		{
			collection = this.db.collection(name)
			
			if (collection.create)
			{
				throw new Error(`"create" method already defined on MongoDB collection`)
			}

			collection.get_by_id = function(id)
			{
				return collection.findOneAsync({ _id: ObjectId(id) })
			}
			
			collection.update_by_id = function(id, actions)
			{
				return collection.updateOneAsync({ _id: ObjectId(id) }, actions)
			}
			
			collection.remove_by_id = function(id)
			{
				return collection.removeAsync({ _id: ObjectId(id) })
			}

			this.collections[name] = collection
			Promise.promisifyAll(collection)
		}

		return collection
	}

	// Converts mongodb entity to JSON object
	// (`_id` ObjectId -> `id` string)
	to_object(entity)
	{
		if (!entity)
		{
			return
		}

		const object = entity //.toObject()
		object.id = object._id.toString()
		delete object._id

		return object
	}

	// returns ObjectID of the inserted JSON object
	inserted_id(result)
	{
		return result.ops[0]._id
	}
}