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
});

// New guide form hide
$(document).ready(() => {
    $('#writeGuide').hide();
    $('#uploadGuide').hide();
});

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

//Rich Text
$(document).ready(() => {
    $('.summernote').summernote({
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


//DataTables
$(document).ready(function () {
    $('.table').DataTable({
        "ordering": false,
        "pageLength": 5
    });
});

//New Client Wizard
$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "slideLeft",
    autoFocus: true,
    stepsOrientation: 0,
    onFinished: function (event, currentIndex) {
        $('#new-client-form').submit();
    },
    onStepChanged: function (event, currentIndex, priorIndex) { 
        $("#cJson").val($("#appointSchedule").jqs('export'));
    }
});

$('#client-contact-name').tooltip({ 'trigger': 'focus', 'title': 'This is the person that Dodd Group are able to contact.' });

$('#appointSchedule').jqs({
    hour: 24,
    periodOptions: false
});

