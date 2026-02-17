/**
 * Get Full Name
 * @name getFullName Concats first name and last name
 * @param {string} firstname in Stringformat
 * @param {string} lastname in Stringformat
 * @return {string}
 */
function getFullName(firstname, lastname) {
  return `${firstname} ${lastname}`.trim();
}

/**
 * Custom submit function
 * @param {scope} globals
 */
function submitFormArrayToString(globals) {
  const data = globals.functions.exportData();
  Object.keys(data).forEach((key) => {
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(',');
    }
  });
  globals.functions.submitForm(data, true, 'application/json');
}

/**
 * Calculate the number of days between two dates.
 * @param {*} endDate
 * @param {*} startDate
 * @returns {number} returns the number of days between two dates
 */
function days(endDate, startDate) {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // return zero if dates are valid
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diffInMs = Math.abs(end.getTime() - start.getTime());
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
* Masks the first 5 digits of the mobile number with *
* @param {*} mobileNumber
* @returns {string} returns the mobile number with first 5 digits masked
*/
function maskMobileNumber(mobileNumber) {
  if (!mobileNumber) {
    return '';
  }
  const value = mobileNumber.toString();
  // Mask first 5 digits and keep the rest
  return ` ${'*'.repeat(5)}${value.substring(5)}`;
}
/**
 * @param {*} mobileNumber;
@returns {String}
 * 
 */

function generateOTP(mobileNumber){
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(otp);
  //removing old session
  if(sessionStorage.getItem("otp")){
    sessionStorage.removeItem("otp");
  }
  sessionStorage.setItem("otp", otp);
  console.log("Stored OTP:", sessionStorage.getItem("otp"))
  return OTP;
}

function validateOTP(otp){
  if(otp===sessionStorage.getItem("otp")){
    console.log("Request Granded...")
    return "Request Granded...";
  }
  console.log("Request Denied")
  return "Request Denied"
}

function saveCardType(card){
  const cardType = card;
  console.log(cardType)
  sessionStorage.setItem("cardType",cardType);
}

function getCardFromSession(card){
  return sessionStorage.getItem(cardType)
}
// eslint-disable-next-line import/prefer-default-export
export {
  getFullName, days, submitFormArrayToString, maskMobileNumber,generateOTP,validateOTP
};
