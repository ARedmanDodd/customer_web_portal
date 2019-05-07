// FAQ search
function searchBar() {
    let input = document.getElementById('faq-search');
    let filter = input.value.toUpperCase();
    let table = document.getElementById('FAQAccordian');
    let tr = table.getElementsByClassName('card');
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByClassName('collapsed');
        if (td[0]) {
            if (td[0].innerText.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = '';
            } else {
                tr[i].style.display = 'none';
            }
        }
    }
}

// Self-Help guide search
$(document).ready(() => {
    $('input:text[name=help-search]').keyup(() => {
        let search = $('#help-search').val().toUpperCase();
        let card = $('.dodd-file');
        let title = $('.dodd-file h5');
        let desc = $('.dodd-file p');
        for (i = 0; i < title.length; i++) {
            if (title[i].innerText.toUpperCase().indexOf(search) > -1 || desc[i].innerText.toUpperCase().indexOf(search) > -1) {
                card[i].style.display = '';
            } else {
                card[i].style.display = 'none';
            }
        }
    })
})

// New guide form hide
$(document).ready(() => {
    $('#writeGuide').hide();
    $('#uploadGuide').hide();
})

// Edit Write guide from hide
$(document).ready(() => {
    $('#uploadGuideEdit').hide();
})

// new guide browser/upload
$(document).ready(() => {
    $('input:radio[name=fileUpload]').change(() => {
        if ($("input[name='fileUpload']:checked").val() == 'false') {
            $('#writeGuide').show();
            $('#uploadGuide').hide();
        }
        if ($("input[name='fileUpload']:checked").val() == 'true') {
            $('#writeGuide').hide();
            $('#uploadGuide').show();
        }
    });
});

// edit guide browser/upload
$(document).ready(() => {
    $('input:radio[name=fileUploadEdit]').change(() => {
        if ($("input[name='fileUploadEdit']:checked").val() == 'false') {
            $('#writeGuideEdit').show();
            $('#uploadGuideEdit').hide();
        }
        if ($("input[name='fileUploadEdit']:checked").val() == 'true') {
            $('#writeGuideEdit').hide();
            $('#uploadGuideEdit').show();
        }
    });
});

// Alert Card Fade
$(document).ready(() => {
    $('#success-alert').fadeTo(2000, 500).slideUp(500, () => {
        $('#success-alert').slideUp(500);
    })
});

// Rich Text
$(document).ready(() => {
    $('#summernote').summernote({
        tabsize: 2,
        height: 100,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['fontname', 'bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['link', 'table', 'hr']],
            ['misc', ['codeview', 'undo', 'redo', 'fullscreen']]
          ]
    });
});

// Rich Text 2
$(document).ready(() => {
    $('#summernote1').summernote({
        tabsize: 2,
        height: 100,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['fontname', 'bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['link', 'table', 'hr']],
            ['misc', ['codeview', 'undo', 'redo', 'fullscreen']]
          ]
    });
})

//DataTables
$(document).ready(function () {
    $('.table').DataTable({
        "ordering": false
    });
});