function requireLogin(req, res, next) {
  if (req.session && req.session.user && req.session.user.username === process.env.ADMIN_USER) {
    return next();
  }
  return res.redirect('/admin/login');
}
module.exports = requireLogin;
