<style>
 #data-table {
    border-collapse: collapse;
    width: 300px;
}

.data-table th {
    padding: 8px;
    text-align: center;
    border-bottom: 1px solid #ddd;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
}

.data-table td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
}

.title-col {
     font-weight: bold;
     text-align: left;
 }
.data-col {
    text-align: center;
}

</style>

<table class="data-table" id="data-table">
    <tr>
        <th></th>
        <th>0-30 DAYS</th>
        <th>31-60 DAYS</th>
        <th>61-90 DAYS</th>
    </tr>
    <tr>
        <td>BASELINE:</td>
        <td class="data-col">${tabledata.current_30_days?number?string.currency}</td>
        <td class="data-col">${tabledata.current_60_days?number?string.currency}</td>
        <td class="data-col">${tabledata.current_90_days?number?string.currency}</td>
    </tr>
    <tr>
        <td>WHAT-IF:</td>
        <td class="data-col">${tabledata.whatif_30_days?number?string.currency}</td>
        <td class="data-col">${tabledata.whatif_60_days?number?string.currency}</td>
        <td class="data-col">${tabledata.whatif_90_days?number?string.currency}</td>
    </tr>
</table>