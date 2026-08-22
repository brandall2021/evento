function buildProgramAgendaMoveInvalidationKeys(courseId) {
  return [["programa-academico", courseId]]
}

module.exports = {
  buildProgramAgendaMoveInvalidationKeys,
}
