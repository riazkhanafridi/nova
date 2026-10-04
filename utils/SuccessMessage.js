const SuccessMessage = (res, message, data = null, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export default SuccessMessage;
