
// START IMPORTS
const Parchment = Quill.import('parchment');
const Delta = Quill.import('delta')
var Link = Quill.import('formats/link');
const BlockEmbed = Quill.import('blots/block/embed');
var Block = Quill.import('blots/block');
let Inline = Quill.import('blots/inline');
var Embed = Quill.import('blots/block/embed');
const Clipboard = Quill.import('modules/clipboard')
// END IMPORTS


const imgStyle = {
  left: {
    display: 'inline',
    float: 'left',
    margin: '0px 1em 1em 0px',
  },
  right: {
    display: 'inline',
    float: 'right',
     margin: '0px 0px 1em 1em',
  },
  center: {
    display: 'block',
    margin: 'auto',
  },
}


// STAR WORD COUNT

class WordCount {
    constructor(quill, props) {
        this.quill = quill;
        this.props = props;
        this.container = this.quill.container;
        this.quill.on('text-change', this.update.bind(this));
        this.toolbar = quill.getModule('toolbar');
        this.update();  // Account for initial contents
    }

    calculate(){
        let text = this.quill.getText();
        text = text.trim();
        // Splitting empty text returns a non-empty array
        return text.length > 0 ? text.split(/\s+/).length : 0;
    }

    update() {
        let length = this.calculate();
        let label = 'word';
        if (length !== 1) {
            label += 's';
        }
        this.toolbar = this.quill.getModule('toolbar');
        let countView = document.getElementById('quill-word-count');
        if (!countView) {
            let countView = document.createElement('span');
            countView.id = 'quill-word-count';
            this.toolbar.container.appendChild(countView);
            countView.innerHTML = length + ' ' + label;
        }
        else{
            countView = document.getElementById('quill-word-count');
            countView.innerHTML = length + ' ' + label;
        }
    }
}

// END WORD COUNT
// const Counter = Quill.import('modules/counter')
/*
quillIndex = 0;
$('.ql-link').on('click', function(){
    var range = quill.getSelection(true);
    console.log('range', range)
    if (range != null) {
      quillIndex = range.index + range.length;
    }
});

$('.ql-editor a').on('click', function(){
    var range = quill.getSelection(true);
    console.log('range', range)
    if (range != null) {
      quillIndex = range.index + range.length;
    }
});
$('.ql-remove').on('click', function(){
    quill.setSelection(quillIndex);
});
*/

// START EXTERNAL LINKING =====================================
class MyLink extends Link {
	static create(raw_value) {
    // console.log('CREATING LINK', raw_value);
    let value = decodeURI(raw_value);
    // console.log('AFTER CREATING LINK', value);
		let node = Link.create(value);
		value = Link.sanitize(value);
		node.setAttribute('href', value);
		if (value.startsWith("https://")) {
			node.setAttribute("target", "_blank");
		} else if (value.startsWith("http://")) {
			node.setAttribute("target", "_blank");
    } else {
      node.removeAttribute('target');
		}
		return node;
	}


	format(name, raw_value) {
    let value = !!raw_value && decodeURIComponent(raw_value);
    // console.log('FORMATTED LINK', value);
		super.format(name, value);
		if (name !== this.statics.blotName || !value) {
			return;
		}

		if (value.startsWith("https://")) {
			this.domNode.setAttribute("target", "_blank");
		} else if (value.startsWith("http://")) {
			this.domNode.setAttribute("target", "_blank");
		} else {
      this.domNode.removeAttribute("target");
		}
	}

  static formats(domNode) {
    // console.log('FORMATS', decodeURI(domNode.getAttribute('href')));

     //console.log('STATIC FORMATS DECODED', decodeURI(domNode.getAttribute('href')))
     return decodeURI(domNode.getAttribute('href'));
   }
}

Quill.register(MyLink);
// END EXTERNAL LINKING =====================================

// START INDENTATION =====================================
class IndentAttributor extends Parchment.Attributor.Style {
  add (node, value) {
    value = parseInt(value)
    if (value === 0) {
      this.remove(node)
      return true
    } else {
      return super.add(node, `${value}em`)
    }
  }
}

let IndentStyle = new IndentAttributor('indent', 'text-indent', {
  scope: Parchment.Scope.BLOCK,
  whitelist: ['1em', '2em', '3em', '4em', '5em', '6em', '7em', '8em', '9em']
})
// END INDENTATION =====================================


// START CLIPBOARD =====================================
class PlainTextClipboard extends Clipboard {
  onPaste (e) {
    if (e.defaultPrevented || !this.quill.isEnabled()) return
    let range = this.quill.getSelection()
    let delta = new Delta().retain(range.index)

    if (e && e.clipboardData && e.clipboardData.types && e.clipboardData.getData) {
      let text = (e.originalEvent || e).clipboardData.getData('text/plain')
      let cleanedText = this.convert(text)

      // Stop the data from actually being pasted
      e.stopPropagation()
      e.preventDefault()

      // Process cleaned text
      delta = delta.concat(cleanedText).delete(range.length)
      this.quill.updateContents(delta, Quill.sources.USER)
      // range.length contributes to delta.length()
      this.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT)

      return false
    }
  }
}

// Quill.register('modules/clipboard', PlainTextClipboard)
// END CLIPBOARD =====================================



// START HR =====================================
class Hr extends Embed {
           static create(value) {
               let node = super.create(value);
               // give it some margin
               node.setAttribute('style', "height:0px; margin-top:10px; margin-bottom:10px;");
               return node;
           }
       }
  Hr.blotName = 'hr'; //now you can use .ql-hr classname in your toolbar
  Hr.className = 'my-hr';
  Hr.tagName = 'hr';
  var customHrHandler = function(){
            // get the position of the cursor
            var range = quill.getSelection();
            if (range) {
                // insert the <hr> where the cursor is
                quill.insertEmbed(range.index,"hr","null")
            }
        }
// END HR =====================================


// ENABLE GRAMMARLY =====================================
$(".ql-editor ").removeAttr("data-gramm");

class GrammarlyInline extends Inline {}
GrammarlyInline.tagName = 'G';
GrammarlyInline.blotName = 'grammarly-inline';
GrammarlyInline.className = 'gr_';
Quill.register(GrammarlyInline);
// END ENABLE GRAMMARLY  =====================================


// START FULL SCREEN =====================================
 target = $('.standalone-container')[0]
 var customButton = document.querySelector('.ql-omega');
 if (customButton) {
   customButton.addEventListener('click', function() {
     if (screenfull.enabled) {
       console.log('requesting fullscreen');
       screenfull.toggle(target);
     } else {

       console.log('Screenfull not enabled');
     }
   });
 }
//  END FULL SCREEN =====================================



// START IMAGES =====================================
var BaseImageFormat = Quill.import('formats/image');
const ImageFormatAttributesList = [
  'id',
  'src',
  'alt',
  'class',
  'height',
  'width',
  'style',
  'data-id',
  'data-kind',
  'data-kind_id',
  'data-caption',
  'data-template',
  'data-description',
]

class ImageFormat extends BaseImageFormat {
  static create(value) {
    let node = super.create();
      if (typeof value === 'string' || value instanceof String) {
        node.setAttribute('src', value);
        node.setAttribute('class', "grid_image");
      } else {
        create_image_element(node, value)
      }

    return node;
  } // END OF CREATE

  static value(node) {
    return {
      caption:  node.getAttribute('data-caption'),
      title: node.getAttribute('alt'),
      src: node.getAttribute('src'),
      width: node.getAttribute('width'),
      width: node.getAttribute('height'),
      class: node.getAttribute('id')
    }
  } // END OF VALUE

  static  formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  } // END OF FORMATS
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value)
    }
  } // END OF FORMAT
}

ImageFormat.blotName = 'image';
ImageFormat.tagName = 'img';
ImageFormat.className = 'grid_image'


class ImageBlot extends BlockEmbed {
    static create(value) {
      let node = super.create();
        $.each(value, function(k, v) {
          console.log("key:" + k)
          console.log("value:" + v)
          if (k != "url") {
            node.setAttribute(k, v);
          }
        })
        node.setAttribute('src', value.url);
        node.setAttribute('class', "grid_image");
        return node;
    }

    static value(node) {
        return {
            alt: node.getAttribute('alt'),
            url: node.getAttribute('src')
        };
    }
}
ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';


function create_image_element(node, value) {
  // console.log("Image node")
  // console.log(node)
  // console.log("O,mae vlaue")
  // console.log(value)
    $.each(value, function(k, v) {
      if (k != "url") {
        node.setAttribute(k, v);
      }
    })

  node.setAttribute('src', value.url || value.src || '');
  node.setAttribute('class', "grid_image");
  node.setAttribute('id', value.id || '');
  node.setAttribute('alt', value.title || '');
  node.setAttribute('class', 'grid_image');
  node.setAttribute('data-id', value.id || '');
  node.setAttribute('data-kind', value.kind || 'Embed');
  node.setAttribute('data-kind_id', value.kind_id || '1');
  node.setAttribute('data-caption', value.caption || '');
  node.setAttribute('data-template', 'image_modal');

  if (value.width){
    node.setAttribute('width', value.width);
  }
  if (value.height) {
    node.setAttribute('height', value.height);
  }
  if (value.align && Object.keys(imgStyle).indexOf(value.align) !== -1) {
    Object.assign(node.style, imgStyle[value.align])
  }
}

// END IMAGES =====================================




$('body').on('click','.btn-submit ', function(event){
  event.preventDefault();
  var html = document.querySelector(".ql-editor").innerHTML
  document.getElementById('acey').value = html
  console.log('somewhere')
  $('.template').submit()
})


var quill;

function initQuill(){
  console.log('INITIALIZING QUILL');
  var htmlInput = $('#quilly').val();
  $(htmlInput).find('a').each((index, a) => a.setAttribute('href', encodeURI(a.getAttribute('href'))))
  $('#editor-container').html(htmlInput)

   quill = new Quill('#editor-container', {
    bounds: '#editor-container',
    //syntax: true,
    scrollingContainer: '.standalone-container',
    theme: 'snow',
    modules: {
          counter: true,
          syntax: true,
          magicUrl: true,
          toolbar: {
            container: [
              [/*{ font: [] }, */{ header: [1, 2, 3, 4, false] }],
              ['bold', 'italic', 'underline', 'blockquote', 'code-block' ],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }, { 'align': [] }],
              [{ 'color': [] }, { 'background': [] }, { 'script': 'super' }, { 'script': 'sub' }],
              ['link', 'image', 'video', 'formula'],
              ['clean', 'html', 'hr'] //'omega',
            ],
            handlers: {
              image: quill_img_handler,
              'hr': customHrHandler
             },
          },
      },
  placeholder: 'Write a Masterpiece!'
  });

  var typingTimer;                //timer identifier
  var doneTypingInterval = 500;  //time in ms (2 seconds)
    //setup before functions
    quill.on('text-change', function() {
      //on keyup, start the countdown
      clearTimeout(typingTimer);
              typingTimer = setTimeout(doneTyping, doneTypingInterval);
    });
    //user is "finished typing," do something
    function doneTyping () {
        //do something
        content_value = document.querySelector(".ql-editor").innerHTML
        $('#quilly').val(content_value)
        //console.log(document.querySelector(".ql-editor").innerHTML);
    }
    $('.data').click()

    quill.root.quill = quill;


    // Set selection when clicking embed image
    quill.root.addEventListener('click', (ev) => {
      let image = Parchment.find(ev.target);

      if (image instanceof ImageFormat) {
        quill.setSelection(image.offset(quill.scroll), 1, 'user');
      }
    });
}

function quill_img_handler() {
  //data = { kind: 'Embed' };
  size = $(this).attr('data-size') || 'modal-lg'
  $('#image_upload_modal .modal-dialog').addClass(size)
  $('#image_upload_modal').modal()
  $('#photo_attrib_section').addClass('hide')
  $('input[name="attachment[src]"]').val('');
  $('input[name="attachment[id]"]').val('');
  $('input[name="attachment[kind]"]').val('Embed');
  $('input[name="attachment[kind_id]"]').val('');
  initDropify();
  quill.enable(false);
}

function insertEmbedImage(res, formData) {
  const range = quill.getSelection(true);
  if (replacement_id && $('#' + replacement_id)) {
    $('#' + replacement_id).remove();
    $('#cp_' + replacement_id).remove();
  }
  quill.editor.insertEmbed(range.index, 'image', {
    id: res.uid || formData.get('attachment[id]') || "smaple-id",
    src: res.url || formData.get('attachment[url]'),
    kind: "Embed" || formData.get('kind'),
    class: formData.get('grid_image'),
    kind_id: res.kind_id || formData.get('kind_id'),
    title: res.name || formData.get('attachment[title]'),
    description: formData.get('attachment[description]'),
    caption: res.caption || formData.get('attachment[caption]'),
    width: formData.get('attachment[width]'),
    height: formData.get('attachment[height]'),
    align: formData.get('attachment[align]')
  });
  index_val = range.index;
  quill.editor.insertEmbed(range.index + 2, 'copyright', res);
  //quill.insertText(range.index + 3, ' ', true);
  quill.setSelection(range.index + 3, Quill.sources.SILENT);
  $('#upload_tab_form .dropify-clear').click();
  quill.enable(true);
  quill.insertText(range.index, '\n')

}

// function sleep(delay) {
//   var start = new Date().getTime();
//   while (new Date().getTime() < start + delay);
// }

function setSelect(quill, index_val) {
  quill.setSelection(index_val + 3, Quill.sources.SILENT);
}
function embedImg(quill, index_val, res){
  quill.editor.insertEmbed(index_val + 2, 'copyright', res);
}

function copyright_div(value){
  var html =
      "<span>by <a target='_blank' href='" + value.author_url + "'>" + value.author_name + "</a> " +
      "on <a target='_blank' href='" + value.provider_url + "'>" + value.provider + ".</a> </span> "
  return html;
}

class CopyrightBlot extends BlockEmbed {
  static create(value) {
    // console.log("THIS IS THE VALUE")
    // console.log(value)
    let node = super.create();
      // console.log("THIS IS THE NODE")
      // console.log(node)
    replacement_id = null;
    if (value.uid && value.uid != replacement_id && value.author_url) {
        node.setAttribute('class', 'copyright_highlight');
        node.setAttribute('id', 'cp_' + value.uid);
        $(node).html(copyright_div(value));
    } else {
      if (!value.uid) {
        node = value;
      }
    }
    return node;
  }
  static value(node) {
    return node
  }
}
CopyrightBlot.blotName = 'copyright';
CopyrightBlot.tagName = 'div';
CopyrightBlot.className = 'copyright_highlight'





var quill;
var htmlContent;


// REGISTERS ================================
var AlignStyle = Quill.import('attributors/style/align');
var DirectionStyle = Quill.import('attributors/style/direction');
var FontStyle = Quill.import('attributors/style/font');
var BackgroundStyle = Quill.import('attributors/style/background');
var ColorStyle = Quill.import('attributors/style/color');
var SizeStyle = Quill.import('attributors/style/size');
Quill.register(IndentStyle, true);
Quill.register(BackgroundStyle, true);
Quill.register(ColorStyle, true);
Quill.register(SizeStyle, true);
Quill.register(DirectionStyle, true);
Quill.register(FontStyle, true);
Quill.register(AlignStyle, true);
//Quill.register(ImageBlot, true);
Quill.register(ImageFormat, true);
Quill.register('modules/counter', WordCount);
Block.tagName = 'DIV';
Quill.register(Block, true);
Quill.register({'formats/hr': Hr});
Quill.register(CopyrightBlot, true);

// END REGISTERS ====================================


initQuill();

// Set selection when clicking embed image
quill.root.addEventListener('click', (ev) => {
  let image = Parchment.find(ev.target);

  if (image instanceof ImageFormat) {
    quill.setSelection(image.offset(quill.scroll), 1, 'user');
    replacement_id = image.domNode.id
    console.log("replacement_id:" + replacement_id)
  }
});

// START HTML EDITOR

var htmlButton = document.querySelector('body .ql-html');

htmlButton.addEventListener('click', function() {
	var htmlEditor = document.querySelector('body .ql-html-editor');
  if (htmlEditor){
  	quill.root.innerHTML = htmlEditor.value.replace(/\n/g, "");
    quill.container.removeChild(htmlEditor);
  } else {

    options = {
      //"indent":"auto",
      "indent-spaces":1,
      "wrap":0,
      "markup":true,
      "output-xml":false,
      "numeric-entities":true,
      "quote-marks":true,
      "quote-nbsp":false,
      "show-body-only":true,
      "quote-ampersand":false,
      "break-before-br":true,
      "uppercase-tags":false,
      "uppercase-attributes":false,
      "drop-font-tags":true,
      "tidy-mark":false
    }
    htmlEditor = document.createElement("textarea");
    htmlEditor.className = 'ql-editor ql-html-editor'
    htmlEditor.innerHTML = tidy_html5(quill.root.innerHTML, options).replace(/\n\n/g, "\n");
    quill.container.appendChild(htmlEditor);
  }
});

//  END OF HTML EDITOR
