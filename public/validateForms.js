(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const  forms = document.querySelectorAll('.needs-validation')

  // const checkboxExist = document.getElementById('#writing') || document.getElementById('#coding') || document.getElementById('#drawing') || document.getElementById('#filming');
    
  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {

      form.addEventListener('submit', function (event) {
        
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    

   

    })
})()
          
