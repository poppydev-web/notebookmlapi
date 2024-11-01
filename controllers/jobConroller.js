const fs = require('fs');
const jobDataFile = 'jobData.json';

exports.addJob = (job) => {
    const jobData = this.loadJobData();
    jobData.push(job);
    fs.writeFileSync(jobDataFile, JSON.stringify(jobData, null, 2));
}

exports.removeJob = () =>{
    const jobData = this.loadJobData();
    jobData.shift();
    fs.writeFileSync(jobDataFile, JSON.stringify(jobData, null, 2));
}

exports.loadJobData = () => {
    if(!fs.existsSync(jobDataFile)) {
        return {};
    }
    const data = fs.readFileSync(jobDataFile);
    return JSON.parse(data);
}