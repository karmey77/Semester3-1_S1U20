const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const passport = require('passport')
const bcrypt = require('bcryptjs')

// login
router.get('/login', (req, res) => {
    res.render('login')
})

// login
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login'
}))

// register
router.get('/register', (req, res) => {
    res.render('register')
})

// register
router.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    const errors = []
    if (!name || !email || !password || !confirmPassword) {
        errors.push({ message: '所有欄位都是必填。' })
    }
    if (password !== confirmPassword) {
        errors.push({ message: '密碼與確認密碼不相符！' })
    }
    if (errors.length) {
        return res.render('register', {
            errors,
            name,
            email,
            password,
            confirmPassword
        })
    }
    User.findOne({ email }).then(user => {
        if (user) {
            errors.push({ message: '這個 Email 已經註冊過了。' })
            return res.render('register', {
                errors,
                name,
                email,
                password,
                confirmPassword
            })
        }
        return bcrypt
            .genSalt(10) // 產生「鹽」，並設定複雜度係數為 10
            .then(salt => bcrypt.hash(password, salt)) // 為使用者密碼「加鹽」，產生雜湊值
            .then(hash => User.create({
                name,
                email,
                password: hash // 用雜湊值取代原本的使用者密碼
            }))
            .then(() => res.redirect('/'))
            .catch(err => console.log(err))
    })
})

// logout
router.get('/logout', (req, res) => {
    req.logout()
    req.flash('success_msg', '你已經成功登出。')
    res.redirect('/users/login')
})

module.exports = router