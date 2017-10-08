var path = require('path');
var tester = require('gitbook-tester');
var assert = require('assert');

describe('Gitbook Plugin - Local PlantUML Rendering', function() {
    it('should correctly replace plantuml block with img html tag in book root', function() {
        return tester.builder()
            .withContent('This is a diagram:\n\n{% plantuml %}\nBob->Alice : hello\n{% endplantuml %}')
            .withBookJson({
                plugins: ['local-plantuml']
            })
            .withLocalPlugin(path.join(__dirname, '..'))
            .create()
            .then(function(result) {
                assert.equal(result[0].content, '<p>This is a diagram:</p>\n<p><img src="84918a9a66a4e75be00a46643eab802f.svg"></p>')
            });
    });
    it('should correctly replace plantuml block in nested page with img html tag in book root', function() {
        return tester.builder()
            .withBookJson({
                plugins: ['local-plantuml']
            })
            .withLocalPlugin(path.join(__dirname, '..'))
            .withContent("Linking to [nested page](nesting/nested.md)")
            .withPage(
                "nesting/nested",
                "This is a diagram:\n\n{% plantuml %}\nBob->Alice : hello\n{% endplantuml %}",
                1
            )
            .withPage(
                "notnested",
                "This is a diagram:\n\n{% plantuml %}\nBob->Alice : hello\n{% endplantuml %}",
                0
            )
            .create()
            .then(function(result) {
                assert.equal(result.get("nesting/nested.html").content, '<p>This is a diagram:</p>\n<p><img src="../84918a9a66a4e75be00a46643eab802f.svg"></p>')
            });
    });
    it('should correctly replace plantuml block with img html tag in custom folder', function() {
        return tester.builder()
            .withContent('This is a diagram:\n\n{% plantuml %}\nBob->Alice : hello\n{% endplantuml %}')
            .withBookJson({
                plugins: ['local-plantuml'],
                pluginsConfig: {
                  local_plantuml: {
                    image_path: 'images/puml'
                  }
                }
            })
            .withLocalPlugin(path.join(__dirname, '..'))
            .create()
            .then(function(result) {
                assert.equal(result[0].content, '<p>This is a diagram:</p>\n<p><img src="images/puml/84918a9a66a4e75be00a46643eab802f.svg"></p>')
            });
    });
});
