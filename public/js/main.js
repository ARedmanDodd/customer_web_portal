function searchBar(){
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

function guideSelect(){
    console.log('running');
    // if(document.getElementById('fileUploadNo').checked){
    //     document.getElementById('writeGuide').display = 'none';
    //     document.getElementById('uploadGuide').display = 'block';
    // }
}