const express = require('express')
const Sequelize = require('sequelize')
const bodyParser = require('body-parser')
const { ValidationError } = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})

const app = express()
app.use(bodyParser.json())

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.post('/food-items', async (req, res) => {
    try{
		if (Object.keys(req.body).length == 0) {
			res.status(400).json({message: 'body is missing'})
		}
		else {
			let keys = ['name', 'category', 'calories']
			for (let i = 0; i < Object.keys(req.body).length; i++) {
				if (Object.keys(req.body)[i] !== keys[i] || Object.keys(req.body).length !== keys.length) {
					res.status(400).json({message: 'malformed request'})
				}
			}

			if (req.body.calories < 0) {
				res.status(400).json({message: 'calories should be a positive number'})
			}

			await FoodItem.create(req.body).then( () => {
				res.status(201).json({message : 'created'})
			}).catch( (error) => {
				res.status(400).json({message : 'not a valid category'})
			})
		}
    }
    catch(error) { }
})

module.exports = app