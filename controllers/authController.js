const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  createTokenUser,
  sendVerficationEmail,
  sendResetPasswordEmail,
  createHash,
  attachCookieToResponse,
} = require('../utils')
const crypto = require('crypto')

const register = async (req, res) => {
  const { email, name, password, branch, yearOfAdmission } = req.body

  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    if (emailAlreadyExists.isVerified) {
      throw new CustomError.BadRequestError(
        'Email already exists!!, Please Login'
      )
    }
    throw new CustomError.BadRequestError(
      'Email not verified Please check your email!!'
    )
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'student'

  const verificationToken = crypto.randomBytes(40).toString('hex')

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
    branch,
    yearOfAdmission,
  })
  sendVerficationEmail({
    name,
    email,
    verificationToken,
    origin: process.env.HOSTED_URL,
  })
  res.status(StatusCodes.CREATED).json({
    msg: 'Success!! Please verify your email',
  })
}

const registerForAdmin = async (req, res) => {
  const { email, name, password, branch, yearOfAdmission, role } = req.body

  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    if (emailAlreadyExists.isVerified) {
      throw new CustomError.BadRequestError(
        'Email already exists!!, Please Login'
      )
    }
    throw new CustomError.BadRequestError(
      'Email not verified Please check your email!!'
    )
  }

  const verificationToken = crypto.randomBytes(40).toString('hex')
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
    branch,
    yearOfAdmission,
  })
  sendVerficationEmail({
    name,
    email,
    verificationToken,
    origin: process.env.HOSTED_URL,
  })
  res.status(StatusCodes.CREATED).json({
    msg: 'Success!! Please verify your email and use forgot password to set a new password',
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePasswords(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email')
  }
  const tokenUser = createTokenUser(user)

  attachCookieToResponse({ res, user: tokenUser })
  // res.header('Access-Control-Allow-Origin', 'https://igec.netlify.app')
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const loginWithTwoCookies = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email')
  }
  const tokenUser = createTokenUser(user)

  // create refresh token
  let refreshToken = ''
  // check refresh token
  const existingToken = await Token.findOne({ user: user.user_id })

  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    res.status(StatusCodes.OK).json({ user: tokenUser })
    return
  }
  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip

  const userToken = { refreshToken, ip, userAgent, user: user._id }
  await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

const verifyEmail = async (req, res) => {
  const { token, email } = req.body
  if (!token || !email) {
    throw new CustomError.BadRequestError(
      'Please provide email and Verification Token'
    )
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      'User with following email does not exists'
    )
  }
  const match = user.verificationToken === token
  if (!match) {
    throw new CustomError.UnauthenticatedError('Verification Failed!!')
  }
  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''
  await user.save()
  res.status(StatusCodes.OK).json({
    msg: 'Successfully verified email, Use forgot password to set a new password',
  })
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new CustomError.BadRequestError('Please provide email!!')
  }
  const user = User.findOne({ email })
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')
    const oneDay = 1000 * 60 * 60 * 24
    const passwordTokenExpirationDate = new Date(Date.now() + oneDay)

    await sendResetPasswordEmail({
      email: user.email,
      passwordToken,
      name: user.name,
      origin: process.env.HOSTED_URL,
    })

    user.passwordToken = createHash(passwordToken)
    user.passwordTokenExpirationDate = passwordTokenExpirationDate

    await user.save()
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: 'password reset link has been successfully sent to you' })
}

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body
  if (!email || !token || !password) {
    throw new CustomError.BadRequestError('Please provide all the values!!')
  }
  const user = await User.findOne({ email })
  if (user) {
    if (
      createHash(token) === user.passwordToken &&
      user.passwordTokenExpirationDate > Date.now()
    ) {
      user.password = password
      user.passwordToken = null
      user.passwordTokenExpirationDate = null

      await user.save()
      return res
        .status(StatusCodes.OK)
        .json({ msg: 'password updated successfully' })
    }
  }
  throw new CustomError.UnauthenticatedError('Invalid Credentials')
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerForAdmin,
}
