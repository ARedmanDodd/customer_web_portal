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

$(document).ready(() => {
    $('.go-back').click(() => {
        window.history.go(-1); 
        return false;
    })
})

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

$('#client-contact-name').tooltip({ 'trigger': 'focus', 'title': 'This is the person that Dodd Group are able to contact.' });

function randString(id) {
    let dataSet = $(id).attr('data-character-set').split(',');
    let possible = '';
    if ($.inArray('a-z', dataSet) >= 0) {
        possible += 'abcdefghijklmnopqrstuvwxyz';
    }
    if ($.inArray('A-Z', dataSet) >= 0) {
        possible += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if ($.inArray('0-9', dataSet) >= 0) {
        possible += '0123456789';
    }
    if ($.inArray('#', dataSet) >= 0) {
        possible += '![]{}()%&*$#^<>~@|';
    }
    let text = '';
    for (let i = 0; i < $(id).attr('data-size'); i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Create a new password
$("#genPass").click(() => {
    let field = $('#cRootPass');
    let show = $('#genPassShow');
    let string = randString(field)
    field.val(string);
    show.text(string);
});

function ID() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

$('#genUser').click(() => {
    $('#cRootUser').val(ID());
});

// New client form validation
let clientForm = $('#new-client-form');
if(clientForm.length > 0){
    clientForm.validate({
        errorPlacement: function errorPlacement(error, element) {
            element.after(error);
        },
        errorClass: 'is-invalid',
        validClass: 'is-valid'
    });
}

//New Client Wizard
$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "slideLeft",
    autoFocus: true,
    stepsOrientation: 0,
    onStepChanging: function (event, currentIndex, newIndex) {
        clientForm.validate().settings.ignore = ":hidden";
        return clientForm.valid();
    },
    onFinishing: function (event, currentIndex) {
        clientForm.validate().settings.ignore = ":disabled";
        return clientForm.valid();
    },
    onFinished: function (event, currentIndex) {
        $("#cJson").val($("#appointSchedule").jqs('export'));
        $('#new-client-form').submit();
    }
});

$('#appointSchedule').jqs({
    hour: 24,
    periodOptions: false
});

// Report form validation
let reportForm = $('#new-report-wizard-form');
if (reportForm.length > 0) {
    reportForm.validate({
        errorPlacement: function errorPlacement(error, element) {
            element.after(error);
        },
        errorClass: 'is-invalid',
        validClass: 'is-valid'
    });
}

//New Report Wizard
$("#new-report-wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "slideLeft",
    autoFocus: true,
    stepsOrientation: 0,
    onStepChanging: function (event, currentIndex, newIndex) {
        reportForm.validate().settings.ignore = ":disabled,:hidden";
        return reportForm.valid();
    },
    onFinishing: function (event, currentIndex) {
        reportForm.validate().settings.ignore = ":disabled";
        return reportForm.valid();
    },
    onFinished: function (event, currentIndex) {
        $('#new-report-wizard-form').submit();
    }
});

// Text area auto expand
var textarea = document.querySelector('textarea');

textarea.addEventListener('keydown', autosize);

function autosize() {
    var el = this;
    setTimeout(function () {
        el.style.cssText = 'height:auto; padding:0';
        el.style.cssText = 'height:' + el.scrollHeight + 'px';
    }, 0);
}

// Live Chat
jQuery(document).ready(function ($) {
    // Animate Floating MonsterLink into view on page load
    $(".dodd-live-chat").addClass("show");

    // Animate out of view function
    function closeFloatingMonsterLink(e) {
        e.preventDefault();
        $(".dodd-live-chat").removeClass("show");
    }
    // Triggers that run closeFloatingMonsterLink function
    $('.dodd-live-chat .float-close').click(closeFloatingMonsterLink);

});

$('#live-chat-button').click(function () {
    window.open('https://tawk.to/chat/5cdbcc052846b90c57ae902e/default', 'Live Chat', 'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350');
});