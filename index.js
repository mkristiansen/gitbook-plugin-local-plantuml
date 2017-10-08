var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var util = require('util');
var path = require('path');
var childProcess = require('child_process');
var Entities = require('html-entities').XmlEntities;
var marked = require('marked');

var PLANTUML_JAR = path.join(__dirname, 'vendor/plantuml.jar');
var DEFAULT_IMAGE_FOLDER = '/';

var entities = new Entities();

function hashedImageName(content) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(content);

  return md5sum.digest('hex')
}

function parseUmlText(sourceText) {
  var umlText = entities.decode(sourceText).replace(/(^[ \t]*\n)/gm, '');
  umlText = marked(umlText).replace(/^<p>/, '').replace(/<\/p>\n$/, '');
  umlText = entities.decode(umlText);

  return umlText;
}

module.exports = {
  blocks: {
    plantuml: {
      process: function (block) {
        var config = this.config.values.pluginsConfig["local_plantuml"];
        var imagePath = DEFAULT_IMAGE_FOLDER;

				if (config)
				{
					imagePath = config.image_path ? config.image_path : DEFAULT_IMAGE_FOLDER;
				};

        var defaultFormat = this.output.name == 'ebook'? '.png' : '.svg';
        var outputFormat = this.output.name == 'ebook'? '-tpng' : '-tsvg';

        var umlText = parseUmlText(block.body);
        var re = /@startditaa/

        if (re.test(umlText)) {
            defaultFormat = '.png';
        }

        var imageName = hashedImageName(umlText) + defaultFormat;
        var cachedImagePath = path.join(os.tmpdir(), imageName);
        var imagePathName = path.join(imagePath, imageName);

        if (fs.existsSync(cachedImagePath)) {
          this.log.info("skipping plantUML image for ", imagePathName);
        }
        else {
          this.log.info("§rendering plantUML image to ", imagePathName);

          var cwd = cwd || process.cwd();

          childProcess.spawnSync("java", [
              '-Dplantuml.include.path=' + cwd,
              '-Djava.awt.headless=true',
              '-jar', PLANTUML_JAR, outputFormat,
              '-charset', 'UTF-8',
              '-pipe'
            ],
            {
              // TODO: Extract stdout to a var and persist with this.output.writeFile
              stdio: ['pipe', fs.openSync(cachedImagePath, 'w'), 'pipe'],
              input: umlText
            });
        }

        this.log.debug("copying plantUML from tempDir for ", imagePathName);
        this.output.copyFile(cachedImagePath, imagePathName);

        return "<object data=\"" + path.join("/", imagePathName) + "\" type=\"image/svg+xml\" width=100%></object>";
      }
    }
  }
};
