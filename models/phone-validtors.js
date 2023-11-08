const PHONE_VALIDATORS = [
  {
    validator: (v) => {
      v.replace("-", "")
      return v.trim().length >= 8
    },
    message: props => `${props.value} must be at least 8 digits!`
  },
  {
    validator: (v) => /^\d{2,3}-\d*$/.test(v.trim()),
    message: props => `${props.value} must be separated by a single dash (-), staring with 2 or 3 numbers. eg. 09-1234556 and 040-22334455 are valid phone numbers
    `
  },
]

module.exports = Object.freeze(PHONE_VALIDATORS)