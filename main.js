$('body').on('click', '.disabled', function(event){
  //event.preventDefault()
  event.stopPropagation()
});

$('body').on('click', '.toggle_navigation_bars', function(event){
  $('.navbar-default').first().toggleClass('hide');
  $('.navbar-default').last().toggleClass('hide');
  $('.fs-m').each(function () {
      if ($(this).hasClass('rvs')) {
        $(this).removeClass();
        $(this).attr('class', classes[$(this).attr('id')])
      } else {
        classes[$(this).attr('id')] = $(this).attr('class')
        $(this).removeClass();
        $(this).attr('class', 'fs-m col-md-12 rvs')
      }
  });

});

var classes = {};
var replacement_id;

$('body').on('submit', '#upload_tab_form', function(event){
  event.preventDefault()
  //event.stopPropagation()
  var $form = $(this);
  var fileInput = $($(this).attr('id') + ' input[name="file"]');
  var formData = new FormData(document.getElementById($(this).attr('id')));
  var url = $(this).attr('action')
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/files/add');
  xhr.onload = function() {
      if (xhr.status === 201 || xhr.status == 200) {
        var res = JSON.parse(xhr.responseText);
        $('#image_upload_modal').modal('hide');
        if (![null, 1, 0, "", "1", "0"].includes(res.params.attachment.kind_id)) {
          $('.ldata').click();
        }
        else {
          console.log("NO KIND ID")
          console.log(res)
          insertEmbedImage(res, formData);
        }
    } else {
      $('#image_upload_modal').modal('hide');
    }
  }
  return xhr.send(formData);
})

// IMAGE MODAL ====================================
// function initImageModalTabs(data, e) {
//   // e contains info of clicked image (to edit image)
//   if (('#image-modal-tabs').length) {
//     handleImageModalFormSubmit(e)
//     if (!data.id) {
//       initDropify()
//     } else {
//       setImagePreview(data)
//     }
//   }
//   $('#image-modal-tabs').bootstrap();
//   $('#image-modal-tabs .tabs-title.from-api').click(function(event) {
//     event.preventDefault();
//     var tab = $(this).find('a')[0].getAttribute('data-tabs-target');
//     var url = $(this).attr('dataa-url');
//     resetFetchImageParams();
//     current_image_modal_tab = tab
//     fetch_image_url = url
//     fetchTabImages(tab, url);
//   })
// }

function getUrlVars(url) {
    var vars = [], hash;
    var hashes = url.src.slice(url.src.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function initDropify() {
  if ($('.dropify').length) {
    var dropify = $('.dropify').dropify();
    var imageWidth = $('input[name="attachment[width]"]');
    var imageHeight = $('input[name="attachment[height]"]');
    var imageName = $('input[name="attachment[title]"]');
    var imageSrc = $('input[name="attachment[src]"]');
    var imageId = $('input[name="attachment[id]"]');
    var imageCaption = $('textarea[name="attachment[caption]"]');
    var imageKind = $('input[name="attachment[kind]"]');

    dropify
    .on('change', function() {
      if ($(this).parent().hasClass('has-error')) {
        $('#image-info').addClass('hide');
      } else {
        setTimeout(function() {
          var img = $('.dropify-preview .dropify-render img');
          getImageSizes(img.attr('src'), function(w, h) {
            imageWidth.val(w);
            imageHeight.val(h);
          })
          filename = $('.dropify-preview .dropify-infos .dropify-infos-inner .dropify-filename .dropify-filename-inner').text()
          imageName.val(filename)
          $('#image-info').removeClass('hide');
          if ($('#upload').length) {
            $('#image_embed_post_form').attr('action', '/attachments')
          }
        }, 100);
      }
    })
    .on('dropify.afterClear', function() {
      imageWidth.val('');
      imageHeight.val('');
      imageName.val('');
      imageSrc.val('');
      imageKind.val('');
      //imageId.val('');
      imageCaption.val('')
      $('#image-info').addClass('hide');
    });
  }
}

// GET IMAGE SIZES
function getImageSizes(url, callback) {
  var img = new Image();
  img.src = url;
  img.onload = function() {
    callback(this.width, this.height);
  }
}

function imageFromURL(e) {
  e.preventDefault();
  var src = $('#image_url_form input')[0].value
  var formData = new FormData();
  var xhr = new XMLHttpRequest();
  formData.append('url', src);
  // Add any event handlers here...
  //document.getElementById("user_photo").src="https://s3.us-east-2.amazonaws.com/" + reply.pic;
  // xhr.onprogress = function(event){
  //   $('.image_add').innerHTML = "<div class=" + "image_loader>" + "</div>"
  // }
  xhr.onload = function() {
    if (xhr.satus === 201 || xhr.status == 200) {
      var res = JSON.parse(xhr.responseText);
      var data = res.file
      console.log(res)
      load_web_image(data)
      //Outputs a DOMString by default
    }
  }
  xhr.open('POST', '/files/embed', true);
  xhr.send(formData)

}

function load_web_image(data) {
  var src = data.url
  if (src.startsWith('http')) {
    var img = new Image();
    img.src = src;
    $(img).attr('data-src', src);
    $(img).attr('class', 'grid_image');
    img.onload = function() {
      $('body #result_pane').html($('#web_image_preview').html())
      $('body #web_image_preview_object').attr('src', src);
      $('body #web_image_preview_object').attr('alt', data.name);
      $('body #web_image_preview_object').attr('data-src', src);
      $('body #web_image_preview_object').attr('data-caption', data.caption);
      $('body #web_image_preview_object').attr('data-id', data.uid);
      $('body #web_image_preview_object').attr('data-title', data.name);
      $('body #web_image_preview_object').attr('data-type', data.type);
    }
  }
}
$('body').on('click', '.grid_image', function(){
  $('#image_upload_modal').modal()
  $('body #upload_tab').click();
  var data = $(this).data()
  data['id'] = data.id || $(this).attr('id')
  data['src'] =  data.src || $(this).attr('src')
  data['title'] = $(this).attr('alt') || data.title
  data['caption'] =  data.caption || $(this).attr('caption')
  data['width'] =  data.width || $(this).attr('width')
  data['height'] =  data.height || $(this).attr('height')
  setImagePreview(data);
});

function setImagePreview(data) {
  var dropify = $('body .dropify').dropify();
  dropify = dropify.data('dropify');
  url = data.src
  dropify.settings['defaultFile'] = url;
  dropify.destroy();
  dropify.init();
  var url = '/files/upload';
  console.log("BOUT TO LOG DATA")
  console.log(data)
  $.each(data, function(k, v) {
    if( k != "caption" && $('input[name="attachment['+ k +']"]')){

      $('input[name="attachment['+ k +']"]').val(v)
    }
    else if($('textarea[name="attachment['+ k +']"]')){

          $('textarea[name="attachment['+ k +']"]').val(v)
        }
    else {
      var field = document.createElement("INPUT");
      $(field).attr('name', 'attachment['+ k +']')
      $(field).attr("value", v);
      $(field).attr("type", "hidden");
      $('#upload_tab_form').append(field)
    }
  })
  if (data.provider_url && data.provider_url.length > 0) {
    $('#photo_attrib_section').removeClass('hide')
    $('#photo_provider_attrib').text(data.provider)
    $('#photo_provider_attrib').attr('href', data.provider_url)
    $('#photo_user_attrib').text(data.author_name)
    $('#photo_user_attrib').attr('href', data.author_url)
  } else {
    $('#photo_attrib_section').addClass('hide')
  }

  var current_title = $('input[name="attachment[title]"]').val();
  $('input[name="attachment[title]"]').val(current_title || 'default title');
  
  // var trixEditor = document.querySelector("trix-editor");
  $('input[name="attachment[url]"]').val(data.src.split('?')[0]);
  //replacement_id = $('input[name="attachment[id]"]').val()
  var imageWidth = $('input[name="attachment[width]"]');
  var imageHeight = $('input[name="attachment[height]"]');
  if (data.kind_id) {
      var imageKind = $('input[name="attachment[kind]"]').val(data.kind)
      var imageKindId = $('input[name="attachment[kind_id]"]').val(data.kind_id)
    }

  if (!data.width && !data.height) {
    getImageSizes(data.src, function(w, h) {
      imageWidth.val(w);
      imageHeight.val(h);
    })
  } else {
    imageWidth.val(data.width);
    imageHeight.val(data.height);
  }
}

$('body').on('submit', '#image_url_form', function(event){
  imageFromURL(event)
});

$('body').on('click', '.load_more_button', function(event){
  $('#' + $(this).attr('data-div') + ' .internal_loader').last().click()
});

$('body').on('submit', '#image_search_form', function(event){
  event.preventDefault();
  // var data_params = JSON.stringify( $(this).serializeArray() );
  var data_params = getFormData($(this));
  render_from_form($(this), data_params)
});

$('#image_upload_modal').on('hidden.bs.modal', function (e) {
  $('#upload_tab_form .dropify-clear').click();
  quill.enable(true);
})

// END IMAGE MODAL ================================

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}
// TABS SWITCHING =================================
// $('body').on('click', '.sttabs nav ul li', function(){
//   console.log('fwahaha!')
// });
$('body').on('click', '.sttabs nav ul li', function(){
  tab = $(this).children().first().attr('href');
  //console.log(tab)
  //$(tab).attr('data-template')
  render(tab)
  //console.log(tab + ' .idata')
  //$(tab + ' .idata')

});
// END TAB SWITCHING ==============================


// MODAL TEMPLATING =====================================
 var data_params = {}
 var loaded = false

 // function getTabImages(action, params) {
 //   $.getJSON(action, params, function(res) {
 //    var data = {}
 //    return res
 //   }
 //  }

 function transition(html, target, type) {
  result = $('#' + target)
  if (type == "append") {
    result.append(html)
  } else {
    result.html(html)
  }
  //result.innerHTML = html;
  setTimeout(function(){
        //$('#tokenfield').tokenfield();
    //    var $elt = $('#post-tags').tagsinput('input');
      //  $('#post-tags').tagsinput('refresh');
    $('.hide').toggleClass('hide');
  }, 100);

 //wait render, wait.. render select then fade
 }

 function render_liquid_template(template, target, data){
  var engine = new Liquid()
  var result = document.querySelector('#' + target)
  template = get_template(template)
  //console.log(template)
  if (template) {
    engine
       //.renderFile(template, data)
      .parseAndRender(template, data)
      .then(
        html => transition(html, target, '')
        )
      .catch(function (e) {
      console.log(e)
               alert("Error, loading assets");
        });
  }
 }

 function append_liquid_template(template, target, data){
  var engine = new Liquid()
  var result = document.querySelector('#' + target)
  template = get_template(template)
  //console.log(template)
  if (template) {
    engine
       //.renderFile(template, data)
      .parseAndRender(template, data)
      .then(
        html => transition(html, target, 'append')
        )
      .catch(function (e) {
      console.log(e)
               alert("Error, loading assets");
        });
  }
 }

 $('body').on('click', '.idata', function(event) {
   render($(this))
   if ($('.data-transfer')) {
     //console.log("TRANSFERING ATTRIBUTES")
     $('.data-transfer').click()
   }
   event.stopPropagation();
 })

 function render_from_form(obj_id, data_params){
   obj = $(obj_id)
   //obj = document.getElementById(obj_id.substring(1))
   var url = $(obj).attr('data-url')

   $.each($(obj)[0].attributes, function(k, v) {
     if (v.name.startsWith("data-")) {
       data_params[v.name.replace("data-", "")] = v.value
     }
   })
  //  $('#data').innerHTML = "<div class=" + "loader" + "</div>"

   if (url) {
     data_from_endpoint(url, data_params)
   } else {
     data_from_local()
   }

   return false
 }

 function render(obj_id){
   obj = $(obj_id)
   //obj = document.getElementById(obj_id.substring(1))
   var loaded = $(obj).attr('data-loaded')
   if (loaded && loaded == "false"){
     loaded = false
     perform_render(obj);
     $(obj).attr('data-loaded', "true")
   } else if (loaded && loaded == "true"){
     loaded = true
   } else {
     loaded = false
     perform_render(obj);
   }
 }

 function perform_render(obj) {
   var url = $(obj).attr('data-url')
   data_params = $(obj).data() || {}
   data_params['page'] = data_params.page || 1
   data_params['append'] = data_params.append || false
   if (url && url != "image_results") {
     data_from_endpoint(url, data_params)
   } else {
     data_from_local()
   }
   setTimeout(function() {
     $('#' + $(obj).attr('id') + ' .idata').click();
   }, 500);
  return false
 }
 function data_from_local() {
   if (data_params.append == true) {
     append_liquid_template(data_params.template, data_params.target, {})
     // scroll to new data
   } else {
     render_liquid_template(data_params.template, data_params.target, {})
   }
 }

 function data_from_endpoint(url, data_params) {
  $.getJSON(url, data_params, function(data) {
    data['params'] = data.params || data_params
    if (data_params.append == true) {
      append_liquid_template(data_params.template, data_params.target, data)
      // scroll to new data
    } else {
      render_liquid_template(data_params.template, data_params.target, data)
    }
  }).always(function() {

  }).fail(function() {
    alert('Failed. Please try again later')
  })
 }

// END TEMPLATING ===========================================



/*jslint browser: true*/
/*global $, jQuery, alert*/

$("body").on("click", ".copy_to_clip", function(){
    var copyText = document.getElementById($(this).attr("data-ref"));
    $(copyText).toggleClass("hide");
    copyText.select();
    document.execCommand("Copy");
    $(copyText).toggleClass("hide");
    toastr.info("Copied");
  }
)
/*jslint browser: true*/
/*global $, jQuery, alert*/

//
// function quill_img_handler() {
//     let fileInput = this.container.querySelector('input.ql-image[type=file]');
//
//     if (fileInput == null) {
//         fileInput = document.createElement('input');
//         fileInput.setAttribute('type', 'file');
//         fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
//         fileInput.classList.add('ql-image');
//         fileInput.addEventListener('change', () => {
//             const files = fileInput.files;
//             const range = this.quill.getSelection(true);
//
//             if (!files || !files.length) {
//                 toastr.warning('No files selected');
//                 return;
//             }
//
//             var _csrf_token = document.getElementById('_csrf_token').value;
//             const formData = new FormData();
//             formData.append('file', files[0]);
//             formData.append('_csrf_token', _csrf_token);
//             formData.append('kind', 1);
//             formData.append('kind_id', document.getElementById('k_id').value);
//             formData.append('source', "Embed");
//
//             this.quill.enable(false);
//
//             axios
//                 .post('/file/upload', formData)
//                 .then(response => {
//                     this.quill.enable(true);
//                     this.quill.editor.insertEmbed(range.index, 'image', {
//                       src: response.data.url_path,
//                       title: response.data.title || response.data.alt
//                     });
//                     this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
//                     this.quill.insertText(-1, ' ', ' ', true)
//                     fileInput.value = '';
//                 })
//                 .catch(error => {
//                     toastr.error("Image upload failed")
//                     this.quill.enable(true);
//                 });
//         });
//         this.container.appendChild(fileInput);
//     }
//     fileInput.click();
// }

$('.modal-form').on('submit', function(){
   $(this).f
});


function select(){
   event.preventDefault();
   $(".image_upload").click();
};

$('body').on('click', '.image_add', function(event){
  size = $(this).attr('data-size') || 'modal-lg'
  $('#image_upload_modal .modal-dialog').addClass(size)
  $('#image_upload_modal').modal()
  $('input[name="attachment[src]"]').val('');
  $('input[name="attachment[id]"]').val('');
  $('input[name="attachment[kind_id]"]').val($(this).attr('data-kind_id'));
  initDropify();
  event.stopPropagation();
});

function upload(){
   $('body .image_add').hide()
   $('body .image_loader').show()
   event.preventDefault();
   var form = document.createElement("form");
   form.setAttribute('enctype',"multipart/form-data");
   var formData = new FormData();
   var xhr = new XMLHttpRequest();
   var fileInput = document.getElementById('file_upload');
   var post_id = document.getElementById('post_id').value;
   var _csrf_token_field = document.getElementById('_csrf_token');
   var _csrf_token =  _csrf_token_field.value;
   var file = fileInput.files[0];
   formData.append('_csrf_token', _csrf_token);
   formData.append('kind_id', post_id);
   formData.append('kind', "Post");
   formData.append('file', file);
   // Add any event handlers here...
   //document.getElementById("user_photo").src="https://s3.us-east-2.amazonaws.com/" + reply.pic;
   xhr.onprogress = function(event){
     $('.image_add').innerHTML = "<div class=" + "image_loader>" + "</div>"
   }
   xhr.onload = function() {
   if (xhr.satus === 201 || xhr.status == 200) {
     target = $('#get_image')
     id = target.attr('data-id')
     params = {attachment_id: target.attr('data-attachment_id')}
     url = "/attachments/" + id
     $.getJSON(url, params, function(data) {
          if (data.error){
              target.src = data.error
            }
          else {
            render_template("#image_rows", data).then(function(html){
              $('#get_image').html(html)
           });
           }
     })
     //Outputs a DOMString by default
   }
 }
   xhr.open('POST', '/image/upload', true);
   xhr.send(formData)
};


$('body').on('change', '.dropify-render', function(){
   file_upload($(this).attr('id'));
});


function file_upload(){
   var $form = $('#upload');
   var file = document.getElementById('file_load').files[0];
   var token = document.getElementById("_csrf_token");
   console.log(file)

   $.ajax({
     url: "/file",
     type: 'POST',
     dataType: 'json',
     // Pass in the data that our API expects
     data: {filename: file.name, mimetype: file.type, _csrf_token: token.value, size: file.size},
     success: (response) => {
           console.log(response)
           var params = {}
           formData = new FormData();
           formData.append('key', response.signature.key)
           //gets all fields from response and adds them to the form
           formData.append('AWSAccessKeyId', response.signature.AWSAccessKeyId)
           formData.append('acl', response.signature.acl)
           formData.append('success_action_status', response.signature.success_action_status)
           formData.append('policy', response.signature.policy)
           formData.append('signature', response.signature.signature)
           formData.append('Content-Type', response.signature['Content-Type'])
           formData.append('file', file)
           // Now that we have everything, we can go ahead and submit the form for real.
           s3Upload(formData, response.filename)
   }
 })
   .done(function(response) {
   toastr.success('Your File has been successfully created, Submit to upload.')
   })
   .fail(function(data) {
     toastr.warning('Whoops! Something went wrong with creating the file...try again later.')
   });
};


function s4Upload(params, name){
 xhr = new XMLHttpRequest;
 xhr.open("POST", "https://api.romariofitzgerald.com.s3.amazonaws.com", true);
 xhr.upload.onprogress = function(event) {
   var progress = event.loaded / event.total * 100;
   document.getElementById("progressbar").style.width = progress + '%';
 };
 xhr.onload = function() {
   if (xhr.status === 201 || xhr.status == 200) {
       var file = "/vue?url=" + name;
       var preview = document.getElementById('file_preview').src = file;
   };
 };
 return xhr.send(params);
};


var data_params = {page: 1, agency_id: 'all', last_id: 0}
var loaded = false


function transit(html, target) {
 result = $('#' + target)
 result.html(html)
 //result.innerHTML = html;
 setTimeout(function(){
       $('.selectpicker').selectpicker('render');
       //$('#tokenfield').tokenfield();
   //    var $elt = $('#post-tags').tagsinput('input');
     //  $('#post-tags').tagsinput('refresh');
   $('.hide').toggleClass('hide');
 }, 100);

//wait render, wait.. render select then fade
}

function render_template(template, target, data){
 var engine = new Liquid()
 var result = document.querySelector('#' + target)
 engine
   .parseAndRender(get_template(template), data)
   .then(
     html => transit(html, target)
     )
   .catch(function () {
            alert("Error, loading assets");
     });
}

function append_template(template, target, data){
 var engine = new Liquid()
 engine
   .parseAndRender(get_template(template), data)
   .then(html => $('#' + target).append(html))
   .catch(function () {
            alert("Error, appending assets");
     });
}


var getJSON = function(url) {
   var xhr = new XMLHttpRequest();
   xhr.open('get', url, true);
   xhr.responseType = 'json';
   xhr.onload = function() {
     var status = xhr.status;
     if (status == 200) {
       callback(null, xhr.response);
     } else {
       callback(status);
     }
   };
   xhr.send();
};


$(document).on('click', 'body .data', function() {
 var url = $(this).attr('data-url')

 // Grab local params from clicker
 data_params = {page: 1, append: false, agency_id: data_params['agency_id']}

 $.each($(this)[0].attributes, function(k, v) {
   if (v.name.startsWith("data-")) {
     data_params[v.name.replace("data-", "")] = v.value
   }
 })
 console.log(data_params)
 $('#data').innerHTML = "<div class=" + "loader" + "</div>"
console.log(url)
 data_from_url(url)
 return false
})

function get_template(name){
 //template = "/js/liquid_templates" + name + ".html"
 template = $('#' + name).html()
 return template
}

function data_from_url(url) {
 $.getJSON(url, data_params, function(data) {
   console.log(data)
   if (data_params.append == true) {
     append_template(data_params.template, data_params.target, data)
     // scroll to new data
   } else {
     render_template(data_params.template, data_params.target, data)
   }
 }).always(function() {
   $('.selectpicker')
   setTimeout(function(){
         $('.selectpicker').selectpicker('render');
       }, 300);
 }).fail(function() {
   alert('Failed. Please try again later')
 })
}

$('#data .selectpicker').selectpicker({
 style: 'btn-info',
 size: 4
});

$('#data').on('submit', 'div form', function(event){
 event.preventDefault();
 data = saveForm($(this), ('renderEdit'))
 if (data['responseJSON']) {
     render_template("/posts/blog/edit", "data", data['responseJSON'].data)

       }
     else {
       alert('The Post Could Not Be Created! Try Again')
     }
});

function editpicker(){
 setTimeout(function(){
       $('.editpicker').selectpicker('render');
     }, 300);
}

$('#data').on('submit', 'form#content-update', function(event){
 event.preventDefault();
 data = saveForm($(this))
 if (data['responseJSON']) {
     $.getJSON('/content', data_params, function(response) {
       append_template("/posts/blog/list", "data", response)
       });
       editpicker()
       }
     else {
       toastr.error("The Post Could Not Be Updated")
     }
});


$('.content_list').click(function(){
 event.preventDefault();
 params = {}
 params['_csrf_token'] = procure_cr()
 params['type'] = $(this).attr('data-type')


 $('#data').innerHTML = "<div class=" + "loader" + "</div>"

 $.getJSON('/content', params, function(response) {
   render_template("/posts/blog/list", "data", response)
   });
})

$('#data').on('click', '#content_edit', function(){
 params = {}
 params['id'] = $(this).attr('data-id')
 var target = $(this).attr('data-target')
 params['_csrf_token'] = procure_cr()
 $.getJSON($(this).attr('data-url'), params, function(response) {
   editpicker();
   render_template("/posts/blog/edit", target, response.data)
   });
});

$('#data').on('click', '#content_view', function(){
 params = {}
 params['id'] = $(this).attr('data-id')
 var target = $(this).attr('data-target')
 params['_csrf_token'] = procure_cr()
 $.getJSON($(this).attr('data-url'), params, function(response) {
   render_template("/posts/blog/view", target, response.data)
   });
});

$('#data').on('click', '#content_drop', function(event){
 event.preventDefault();
 params = {}
 params['id'] = $(this).attr('data-id')
 params['_csrf_token'] = procure_cr()
   cr =
     $.ajax({
       type: 'DELETE',
       url: $(this).attr('data-url'),
       async: false,
       data: params
     })
     .fail(function(data) {
       return data
     })
     .done(function(response) {
       return response
     //  window[func](response.data);
     });
     $(this).closest('.single_post').remove()
});

function procure_cr(){
 cr =
   $.ajax({
     type: 'GET',
     url: '/cr',
     async: false,
     data: {}
   })
   .fail(function(data) {
     return data
   })
   .done(function(response) {
     return response
   //  window[func](response.data);
   });

 cr = cr['responseJSON']['cr']
 return cr
}

function saveForm(form){
     csrf = procure_cr()
     $('#post_tags').val($('#tokenfield').tokenfield('getTokens'))
     var formData = $(form).serialize()
     var append = "_csrf_token=" + csrf + "&"
     formData = append + formData
     rep =
       $.ajax({
         type: 'POST',
         url: $(form).attr('action'),
         async: false,
         data: formData
       })
       .fail(function(data) {
         toastr.error(data['responseJSON'].error);
         return data
       })
       .done(function(response) {
         toastr.success("Your post has been successfully updated.");
         return response
       //  window[func](response.data);
       });
     return(rep)
};

function handle_response(response){
 if (response['responseJSON']) {
   toastr.success(response['status'])
 }
 else if (response['error']){
   toastr.error(response['error'])
 }
 else
 {
   toastr.error(response)
 }
};

$(document).ready(function () {

    "use strict";

    var body = $("body");

    $(function () {
        $(".preloader").fadeOut();
    });

    /* ===== Theme Settings ===== */

    $(".open-close").on("click", function () {
        body.toggleClass("show-sidebar");
    });

    /* ===== Open-Close Right Sidebar ===== */

    $(".right-side-toggle").on("click", function () {
        $(".right-sidebar").slideDown(50).toggleClass("shw-rside");
        $(".fxhdr").on("click", function () {
            body.toggleClass("fix-header"); /* Fix Header JS */
        });
        $(".fxsdr").on("click", function () {
            body.toggleClass("fix-sidebar"); /* Fix Sidebar JS */
        });

        /* ===== Service Panel JS ===== */

        var fxhdr = $('.fxhdr');
        if (body.hasClass("fix-header")) {
            fxhdr.attr('checked', true);
        } else {
            fxhdr.attr('checked', false);
        }
    });

    /* ===========================================================
        Loads the correct sidebar on window load.
        collapses the sidebar on window resize.
        Sets the min-height of #page-wrapper to window size.
    =========================================================== */

    $(function () {
        var set = function () {
                var topOffset = 60,
                    width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width,
                    height = ((window.innerHeight > 0) ? window.innerHeight : this.screen.height) - 1;
                if (width < 768) {
                    $('div.navbar-collapse').addClass('collapse');
                    topOffset = 100; /* 2-row-menu */
                } else {
                    $('div.navbar-collapse').removeClass('collapse');
                }

                /* ===== This is for resizing window ===== */

                if (width < 1170) {
                    body.addClass('content-wrapper');
                    $('.sidebar-nav').addClass('slimscrollsidebar');
                } else {
                    body.removeClass('content-wrapper');
                    $('.sidebar-nav').removeClass('slimscrollsidebar');
                }

                if (width < 700) {
                    $('#side-menu').metisMenu();
                }

                height = height - topOffset;
                if (height < 1) {
                    height = 1;
                }
                if (height > topOffset) {
                    $("#page-wrapper").css("min-height", (height) + "px");
                }
            },
            url = window.location,
            element = $('ul.nav a').filter(function () {
                return this.href === url || url.href.indexOf(this.href) === 0;
            }).addClass('active').parent().parent().addClass('in').parent();
        if (element.is('li')) {
            element.addClass('active');
        }
        $(window).ready(set);
        $(window).bind("resize", set);
    });

    /* ===== Collapsible Panels JS ===== */

    (function ($, window, document) {
        var panelSelector = '[data-perform="panel-collapse"]',
            panelRemover = '[data-perform="panel-dismiss"]';
        $(panelSelector).each(function () {
            var collapseOpts = {
                    toggle: false
                },
                parent = $(this).closest('.panel'),
                wrapper = parent.find('.panel-wrapper'),
                child = $(this).children('i');
            if (!wrapper.length) {
                wrapper = parent.children('.panel-heading').nextAll().wrapAll('<div/>').parent().addClass('panel-wrapper');
                collapseOpts = {};
            }
            wrapper.collapse(collapseOpts).on('hide.bs.collapse', function () {
                child.removeClass('ti-minus').addClass('ti-plus');
            }).on('show.bs.collapse', function () {
                child.removeClass('ti-plus').addClass('ti-minus');
            });
        });

        /* ===== Collapse Panels ===== */

        $(document).on('click', panelSelector, function (e) {
            e.preventDefault();
            var parent = $(this).closest('.panel'),
                wrapper = parent.find('.panel-wrapper');
            wrapper.collapse('toggle');
        });

        /* ===== Remove Panels ===== */

        $(document).on('click', panelRemover, function (e) {
            e.preventDefault();
            var removeParent = $(this).closest('.panel');

            function removeElement() {
                var col = removeParent.parent();
                removeParent.remove();
                col.filter(function () {
                    return ($(this).is('[class*="col-"]') && $(this).children('*').length === 0);
                }).remove();
            }
            removeElement();
        });
    }(jQuery, window, document));

    /* ===== Tooltip Initialization ===== */

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    /* ===== Popover Initialization ===== */

    $(function () {
        $('[data-toggle="popover"]').popover();
    });

    /* ===== Task Initialization ===== */

    $(".list-task li label").on("click", function () {
        $(this).toggleClass("task-done");
    });
    $(".settings_box a").on("click", function () {
        $("ul.theme_color").toggleClass("theme_block");
    });

    /* ===== Collepsible Toggle ===== */

    $(".collapseble").on("click", function () {
        $(".collapseblebox").fadeToggle(350);
    });

    /* ===== Sidebar ===== */

    $('.slimscrollright').slimScroll({
        height: '100%',
        position: 'right',
        size: "5px",
        color: '#dcdcdc'
    });
    $('.slimscrollsidebar').slimScroll({
        height: '100%',
        position: 'left',
        size: "6px",
        color: 'rgba(0,0,0,0.5)'
    });
    $('.chat-list').slimScroll({
        height: '100%',
        position: 'right',
        size: "0px",
        color: '#dcdcdc'
    });

    /* ===== Resize all elements ===== */

    body.trigger("resize");

    /* ===== Visited ul li ===== */

    $('.visited li a').on("click", function (e) {
        $('.visited li').removeClass('active');
        var $parent = $(this).parent();
        if (!$parent.hasClass('active')) {
            $parent.addClass('active');
        }
        e.preventDefault();
    });

    /* ===== Login and Recover Password ===== */

    $('#to-recover').on("click", function () {
        $("#loginform").slideUp();
        $("#recoverform").fadeIn();
    });

    /* =================================================================
        Update 1.5
        this is for close icon when navigation open in mobile view
    ================================================================= */

    $(".navbar-toggle").on("click", function () {
        $(".navbar-toggle i").toggleClass("ti-menu").addClass("ti-close");
    });

    /* ===== Mega Menu ===== */

    $(".mega-nav > .nav-second-level").width($(window).width());

    $(window).on("resize", function () {
        $(".mega-nav > .nav-second-level").width($(window).width());
    });
});
