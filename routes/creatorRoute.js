const express = require('express');
const router = express.Router();
const creatorAuth = require('../middleware/creatorAuth');
const bcrypt = require('bcrypt');
const creatorModel = require('../models/creatorModel');
const courseModel = require('../models/courseModel');
const { z } = require('zod');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
    const { username, password, email, age } = req.body;

    const creator = z.object({
        username: z.string(),
        password: z.string(),
        email: z.string().email("Invalid email format"),
        age: z.number().int().min(0, "Age must be a positive integer")
    });

    try {
        const result = await creator.parseAsync({ username, password, email, age });
        const hashedPassword = await bcrypt.hash(password, 3);
        const model = new creatorModel({
            username: result.username,
            password: hashedPassword,
            email: result.email,
            age: result.age
        });
        model.save();

        res.status(201).send({
            "message": "successfully signed up"
        })
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while signing up ${e}`
        });
    }
});

router.post('/signin', async (req, res) => {
    const { password, email } = req.body;

    const creator = z.object({
        password: z.string(),
        email: z.string().email("Invalid email format")
    });

    try {
        const result = await creator.parseAsync({ password, email });

        const model = await creatorModel.findOne({
            email: result.email
        });

        if (!model) {
            res.status(404).send({
                message: "email not found"
            });
        }

        const success = await bcrypt.compare(result.password, model.password);

        if (success) {
            const token = jwt.sign({
                username: model._id
            }, process.env.JWT_CREATOR_SECRET);

            res.status(201).send({
                "message": "successfully signed in",
                token: token
            })
        } else {
            res.status(404).send({
                message: "password in correct"
            });
        }
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while signing up ${e}`
        });
    }
});

router.get('/courses', creatorAuth, async (req, res) => {
    const id = req.body._id;

    return await courseModel.find({
        creatorId: id
    });
});

router.post('/course', creatorAuth, async (req, res) => {
    const { title, description, imageUrl, price, _id, validity } = req.body;

    const course = z.object({
        title: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        price: z.number(),
        _id: z.string(),
        validity: z.number().int().min(0, "Validity must be a positive integer")
    });

    try {
        const result = await course.parseAsync({ title, description, imageUrl, price, _id, validity });

        // TODO: check for duplicate courses
        const model = await courseModel.create({
            title: result.title,
            description: result.description,
            imageUrl: result.imageUrl,
            price: result.price,
            creatorId: result._id,
            validity: result.validity
        });

        await model.save();
        res.status(201).send({
            message: "course added successfully"
        });
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while creating course ${e}`
        });
    }
});

router.get('/course/:id', creatorAuth, async (req, res) => {
    const { _id } = req.body;
    const courseId = req.params.id;

    try {
        const model = await courseModel.findOne({
            creatorId: _id,
            _id: courseId
        });

        if (!model) {
            res.status(404).send({
                message: "course not found"
            });
        }

        res.status(200).send({
            data: model
        });
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while getting course ${e}`
        });
    }
});

router.put('/course/:id', creatorAuth, async (req, res) => {
    const { title, description, imageUrl, price, _id, validity } = req.body;
    const courseId = req.params.id;

    const course = z.object({
        title: z.string(),
        description: z.string(),
        imageUrl: z.string(),
        price: z.number(),
        _id: z.string(),
        validity: z.number()
    });

    try {
        const result = await course.parseAsync({ title, description, imageUrl, price, _id, validity });

        const model = await courseModel.findOne({
            courseId: courseId,
            creatorId: _id
        });

        if (!model) {
            res.status(404).send({
                message: "course not found"
            });
        }

        const updatedModel = await courseModel.updateOne({
            courseId: courseId,
            creatorId: _id
        }, {
            title: result.title,
            description: result.description,
            imageUrl: result.imageUrl,
            price: result.price,
            creatorId: result._id,
            validity: result.validity
        });

        res.status(201).send({
            message: "updated successfully",
            data: updatedModel
        });
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while updating course ${e}`
        });
    }
});

router.delete('/course/:id', creatorAuth, async (req, res) => {
    const { _id } = req.body;
    const courseId = req.params.id;

    try {
        const model = await courseModel.findOne({
            courseId: courseId,
            creatorId: _id
        });

        if (!model) {
            res.status(404).send({
                message: "course not found"
            });
        }

        await courseModel.deleteOne({
            courseId: courseId,
            creatorId: _id
        });

        res.status(200).send({
            message: "deleted successfully"
        });
    } catch (e) {
        res.status(500).send({
            error: `Something went wrong while updating course ${e}`
        });
    }
});

module.exports = router;