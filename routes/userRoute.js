const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userAuth');
const userModel = require('../models/userModel');
const courseModel = require('../models/courseModel');

router.post('/signin', async (req, res) => {
    const { username, password, email, age } = req.body;

    const user = z.object({
        username: z.string(),
        password: z.string(),
        email: z.string().email("Invalid email format"),
        age: z.number().int().min(0, "Age must be a positive integer")
    });

    try {
        const result = await user.parseAsync({ username, password, email, age });
        const hashedPassword = await bcrypt.hash(password, 3);
        const model = new userModel({
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

router.post('/signup', async (req, res) => {
    const { password, email } = req.body;

    const creator = z.object({
        password: z.string(),
        email: z.string().email("Invalid email format")
    });

    try {
        const result = await creator.parseAsync({ password, email });

        const model = await userModel.findOne({
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
            }, process.env.JWT_USER_SECRET);

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

router.get('/courses', userAuth, async (req, res) => {
    const userId = req.body._id;

    try {
        const courses = await courseModel.find({
            users: { $in: [userId] }
        });

        // TODO: remove users array details, client shouldn't know how many students enrolled
        res.status(200).send({
            data: courses
        })
    } catch (e) {
        res.status(500).send({
            message: "something went wrong while getting courses " + e
        })
    }
});

router.get('/course/:id', userAuth, async (req, res) => {
    const userId = req.body._id;
    const courseId = req.params.id;

    try{
        const course = await courseModel.findOne({
            _id: id
        });
    
        if(!course) {
            res.status(404).send({
                message: "course not found"
            });
        }
    
        if (!course.users.some(x => x._id.toString() === courseId)) {
            res.status(401).send({
                message: "user is not added to the course"
            });
        }
    
        // TODO: remove users array details, client shouldn't know how many students enrolled
        res.status(200).send({
            data: course
        });
    }catch(e) {
        res.status(500).send({
            message: "something went wrong while getting course " + e
        })
    }
});

module.exports = router;