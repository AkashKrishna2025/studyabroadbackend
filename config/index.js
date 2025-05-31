// Fetching the environment
require('dotenv').config();

const env = process.env.NODE_ENV || 'development'
let environments = ['staging', 'development', 'production']
if (!environments.includes(env?.toLowerCase())) {
    console.log('No Valid Environment Passed :: ', env)
    process.exit(1)
}
console.log('\nℹ️ ℹ️ ℹ️   Server will start with :: ✨', env, '✨ :: Environment \n')
            
const commonVariables = {
    STATUS: [200, 500, 400, 401, 403],
    SERVICE_REST_PORT: '8001',
    ROLES: 'ADMIN,USER',
    pageLimit: 10,
    APPLICATION_STATUS: 'Application Submitted,In Progress,Pending Documents,Conditional Offer,Unconditional Offer,Rejected,Closed,Not Eligible,Tuition Deposit Paid,Visa Letter Issued,Visa Filled,Visa Success,Visa Rejected,Application Submitting,CAS Letter,Docs Pending',
    SIGNUP_SOURCES: 'PHONE_NUMBER,LINKEDIN,FACEBOOK,GOOGLE',
    TRANSACTION_STATUS: 'PENDING,COMPLETED,FAILED'
}
//setting the common variables
Object.keys(commonVariables).forEach((key) => {
    process.env[key] = commonVariables[key];
})
