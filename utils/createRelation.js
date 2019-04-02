const modelWrite = require('../generate/modelWrite');
const Log = require('../generate/log');

exports.createRelation = async(model1,model2,relation) =>{
    let migrate = true;
    await modelWrite.addRelation(model1,model2,true,relation)
    .catch(err => {
      Log.error(err.message)
      migrate = false;
    });
    if(migrate)await modelWrite.addRelation(model2,model1,false,relation)
    .then(() => Log.success(`reliatonship between ${model1} and  ${model2} added in models`))
    .catch(err => {
      Log.error(err.message)
      migrate = false;
    });    
  }