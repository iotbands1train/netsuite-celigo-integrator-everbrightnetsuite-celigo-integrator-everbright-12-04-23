var intervalId = '';

/**
 * Function gets the URL parameters and calls the suitelet to get task status
 * 
 * @governance 0 Units
 */
function mybarProgress() {
    var queryString = window.location.search;
    console.log(queryString);
    var urlParams = new URLSearchParams(queryString);
    var depId = urlParams.get('deploymentId')
    console.log(depId);
    intervalId = setInterval(function () { postRequest(depId) }, 10000);
}


/**
 * Function sends the Ajax request to suitelet and sets the progress bar value
 * 
 * @governance 0 Units
 */
function postRequest(depId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
            var resObj = JSON.parse(this.responseText);
            document.getElementById("file").setAttribute("value", resObj.percentComplete);
            if (resObj.status == 'COMPLETE' || resObj.status == 'FAILED' || resObj.status==undefined) {
                clearInterval(intervalId);
            }
        }
    };
    xhttp.open("POST", "/app/site/hosting/scriptlet.nl?script=325&deploy=1&compid=TSTDRV1967913&h=a6e464e710221a6b17a8", true);
    var params = 'custpage_deploymentid=' + depId + '&taskId='
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(params);
}