function buildGuestEnrollmentPayload(values) {
  if (values.password !== values.confirmPassword) {
    throw new Error('Las contraseñas no coinciden')
  }

  return {
    courseId: Number(values.courseId),
    authPayload: {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
    },
  }
}

module.exports = {
  buildGuestEnrollmentPayload,
}
