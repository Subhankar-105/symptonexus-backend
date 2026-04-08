module.exports = function asyncHandler(fn) {
  return function (req, res) {
    fn(req, res).catch((err) => {
      console.error(err);
      return res.sendResponse(400, "Internal server error");
    });
  };
};
