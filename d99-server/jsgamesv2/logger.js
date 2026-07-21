const logger = {
    info: function(msg, data) {
      console.log('INFO: ' + msg, data || '');
    },
    error: function(msg, data) {
      console.error('ERROR: ' + msg, data || '');
    }
};

export default logger;