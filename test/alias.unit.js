(function() {
  'use strict';

  var CHALK_RESULT = '_CHALK_RESULT_';

  var _ = require('lodash');
  var path = require('path');
  var proxyquire = require('proxyquire').noCallThru();
  var requireSubvert = require('require-subvert')(__dirname);

  var chalk = {
    bold: {
      blue: jasmine.createSpy('blue').and.callFake(chalkResult),
      red: jasmine.createSpy('red').and.callFake(chalkResult)
    }
  };

  requireSubvert.subvert('chalk', chalk);

  var short = 'foo';
  var shortWithSub = 'foo sub';

  var fullpath = path.resolve(__dirname);
  var stubs = {};
  stubs[fullpath + '/' + short] = {};
  stubs[fullpath + '/' + _.kebabCase(shortWithSub)] = {};

  var alias = proxyquire('../index', stubs);

  describe('alias', function() {
    describe('when the input data is valid', function() {
      var _alias;

      beforeEach(function() {
        _alias = _.partial(alias, short, __dirname);
        spyOn(process.stdout, 'write');
      });

      it('if options.message is false should log nothing', function() {
        spyOn(console, 'log');
        _alias({message: false});
        expect(process.stdout.write).not.toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalled();
      });

      describe('if options.message is not false', function() {
        it('should use the provided color if it exists', function() {
          var color = 'red';
          _alias({color: color});
          expectInfo(null, color);
        });

        it('should print the provided message if it is a string', function() {
          var message = '_MESSAGE_';
          _alias({message: message});
          expectInfo(message);
        });

        it('should print the default message if one is not provided', function() {
          _alias();
          expectInfo();
        });

        it('should print the default message options.message is `true`', function() {
          _alias({message: true});
          expectInfo();
        });

        it('should print a blank line', function() {
          spyOn(console, 'log');
          _alias();
          expect(console.log).toHaveBeenCalledWith();
        });

        it('should support git style sub-commands', function() {
          alias(shortWithSub, __dirname);
          expectInfo(null, null, shortWithSub);
        });
      });
    });

    describe('when the input data is not valid', function() {
      it('should throw an error if `short` is not provided', function() {
        expect(alias).toThrowError('Missing `short`');
      });

      it('should throw an error if `shortPath` is not provided', function() {
        expect(_.partial(alias, 'foo')).toThrowError('Missing `shortPath`');
      });
    });

    // Make the expectations each time to validate they don't change when options change
    function expectInfo(message, color, command) {
      command = command || short;
      message = message || 'You can also use ' + command + ' as an alias';
      color = color || 'blue';

      expect(chalk.bold[color]).toHaveBeenCalledWith('[INFO]:');
      expect(process.stdout.write).toHaveBeenCalledWith('[INFO]: ');
      expect(process.stdout.write).toHaveBeenCalledWith(message);
    }
  });

  function chalkResult(message) {
    return message;
  }
})();
