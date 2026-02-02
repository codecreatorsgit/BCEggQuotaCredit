import * as React from 'react';
import type { IQuotaCreditProps } from './IQuotaCreditProps';
import './style.css'
import { ApiService } from '../../services/apiservices';
import { alerts, fieldNamesMap, listNames, status } from '../../common/constants/ListNames';
import { TransactionService } from '../../business/transactionservice';
import { daysBetween, formatDate, formatDateFromString, getCurrentDate, weeksBetween } from '../../common/utils/helperfunctions';
const editicon = require('../assets/edit.png')
const deleteicon = require('../assets/delete.png')

const QuotaCredit: React.FC<IQuotaCreditProps> = ({ context }) => {
  const [Producers, setProducers]: any = React.useState([]);
  const [QuotaCredit, setQuotaCredit]: any = React.useState([]);
  const [QuotaCredittype, setQuotaCredittype]: any = React.useState([]);
  const [showmodel, setshowmodel] = React.useState(false);

  const [formData, setFormData] = React.useState<any>({
    Bc_Quota_Credit_Type: '',
    Bc_Quantity_per_Week: '',
    Bc_Flock: '',
    Bc_Application_Date: getCurrentDate(),
    Bc_Start_Date: '',
    Bc_End_Date: '',
    Bc_Description: '',
    Bc_checkbox: false
  });

  // let subtype = React.useRef('');
  const [TransactionTable, setTransactionTable]: any = React.useState([]);
  const [TransactionreportTable, setTransactionreportTable]: any = React.useState([]);
  const [producerkey, setproducerkey]: any = React.useState('');
  const [quotaCreditkey, setquotaCreditkey]: any = React.useState('');
  const [formoneId, setformoneId]: any = React.useState(0);
  const [quotaCreditBalance, setquotaCreditBalance]: any = React.useState(0);
  const [enableEndDate, setEnableEndDate] = React.useState(false);
  const [formStatus, setFormStatus] = React.useState<'editing' | 'submitting'>('submitting');
  const [tempdataUdapte, settempdataUdapte] = React.useState('');
  const [approvalPendingQuotaCredit, setApprovalPendingQuotaCredit] = React.useState(0);

  const api = new ApiService(context)
  const cls = new TransactionService(context)

  /* ===================== INIT ===================== */
  React.useEffect(() => {
    const produceritems = async () => {
      const user = await api.getCurrentUser();
      console.log('Current User:', user);

      const producerdowndataf = await api.filterListItems(
        listNames.ProducerInformation,
        `BCEggAccount/Id eq ${user.Id}`,
        "*"
      );
      console.log('Producer Data:', producerdowndataf);
      console.log(quotaCreditkey)


      let quotaCreditdowndata = await api.filterListItems(
        listNames.QuotaCreditType, "LinkTitle eq 'Usage'",
        'Title'
      );
      console.log('Quota Credit Data:', quotaCreditdowndata);

      let quotaCreditTypedowndata = await api.filterListItems(
        listNames.QuotaCreditTypes,
        "TransactionCategory eq 'Usage'",
        'Id,Title,Subtype,SubType_x0020__x002d__x0020_Desc'
      );
      console.log('Quota Credit Type Data:', quotaCreditTypedowndata);

      setProducers(producerdowndataf);
      setQuotaCredit(quotaCreditdowndata);
      setQuotaCredittype(quotaCreditTypedowndata);
      setproducerkey(producerdowndataf?.[0]?.ID);
      console.log('Selected Producer Key:', producerdowndataf?.[0]?.ID)

      const currentData = await cls.fetchCurrentTransactions(Number(producerdowndataf?.[0]?.ID));
      const historicalData = await cls.fetchHistoricalUsageTransactions(Number(producerdowndataf?.[0]?.ID));
      await cls.fetchHistoricalEarnedTransactions(Number(producerdowndataf?.[0]?.ID));

      console.log('Current Transactions:', currentData);
      console.log('Historical Transactions:', historicalData);

      setquotaCreditBalance(cls.fetchInitialQuotaofProducer());
      setTransactionTable(currentData);
      setTransactionreportTable(historicalData);
    };

    produceritems();
  }, []);
  React.useEffect(() => {
    const total = TransactionTable.reduce(
      (sum: number, row: { Bc_Quantity_per_Week: number; }) => sum + Number(row.Bc_Quantity_per_Week),
      0
    );
    setApprovalPendingQuotaCredit(total);
  }, [TransactionTable]);
  const calculateEndDate = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 91);
    return formatDate(date)
  };
  const actualAllowedCredit =
    quotaCreditBalance - approvalPendingQuotaCredit;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log('Form Change:', name, value);
    if(name === "Bc_Quantity_per_Week"){
      if(Number(value) < 1){
        return;
      }
    }
    if (name === 'Bc_Start_Date') {
      const endDate = calculateEndDate(value);
      setFormData((prev: any) => ({ ...prev, Bc_Start_Date: value, Bc_End_Date: endDate }));
    } else if (name === 'Bc_Quantity_per_Week') {
      let result = TransactionService.validateQuota(Number(value), quotaCreditBalance, approvalPendingQuotaCredit);
      if (!result) {
        alert(alerts.ValidateQuantity)
      } else {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  

  const validateForm = (): boolean => {
    const requiredFields = [
      'Bc_Quota_Credit_Type',
      'Bc_Quantity_per_Week',
      'Bc_Flock',
      'Bc_Application_Date',
      'Bc_Start_Date',
      'Bc_End_Date',
      'Bc_Description'

    ];

    const emptyField = requiredFields.find((field) => !formData[field]);
    if (emptyField) {
      alert(`${alerts.RequiredFields} ${fieldNamesMap[emptyField]}`);
      return false;
    }
    return true;
  };

  const openAddTransactionForm = () => {
    setFormStatus('submitting');
    setFormData({
      Bc_Quota_Credit_Type: '',
      Bc_Quantity_per_Week: '',
      Bc_Flock: '',
      Bc_Application_Date: getCurrentDate(),
      Bc_Start_Date: '',
      Bc_End_Date: '',
      Bc_Description: '',
      Bc_checkbox: false
    });
    setshowmodel(true);
  };


  const buildPayload = cls.Formpayload(formData, producerkey, status);
  console.log('Payload to submit:', buildPayload);

  const handleAllCancel = () => {
    const hasTempData = TransactionTable.some((tb: any) => tb.id < 0);
    console.log('Cancel Temp Data:', hasTempData);
    if (hasTempData) {
      setTransactionTable((prev: any[]) => prev.filter((tb) => tb.id > 0));
      alert(alerts.allcancel);
    }
  };

  const handleAllSubmit = async () => {
    try {
      const tempItems = TransactionTable.filter((tb: any) => tb.id < 0);
      console.log('Items to Submit:', tempItems);
      if (!tempItems.length) {
        alert(alerts.Notransactions);
        return;
      }
      for (const tb of tempItems) {
        const payload = cls.Formpayload(tb, producerkey, status);
        console.log('Submitting Item Payload:', payload);
        await api.insertRecord(listNames.FinalQuotaCreditUsageList, payload);
      }
      alert(alerts.SuccessFullySubmited);

      const currentData = await cls.fetchCurrentTransactions(Number(producerkey));
      console.log('Updated Current Data:', currentData);

      const updatedTable = TransactionTable.map((tb: any) =>
        tb.id < 0 ? { ...tb, counter: '-2' } : tb
      );
      setTransactionTable(updatedTable);
    } catch (error) {
      console.error('Submit Error:', error);
      alert(alerts.catcherrors);
    }
  };

  const resetForm = () => {
    setFormData({
      Bc_Quota_Credit_Type: '',
      Bc_Quantity_per_Week: '',
      Bc_Flock: '',
      Bc_Application_Date: getCurrentDate(),
      Bc_Start_Date: '',
      Bc_End_Date: '',
      Bc_Description: '',
      Bc_checkbox: false
    });
    setshowmodel(false);
    setFormStatus('submitting');
    console.log('Form Reset');
  };

  const insertRowTemp = async () => {
    try {
      if (!validateForm()) return;

      const negativeIdCount = TransactionTable.filter(
        (item: { id: number }) => item.id < 0
      ).length;

      const negatedMaxId = -(negativeIdCount + 1);

      setTransactionTable((prev: any) => [
        ...prev,
        { ...formData, Bc_checkbox: enableEndDate, id: `${negatedMaxId}` }
      ]);
      console.log('Temporary Transaction Added:', formData);
      alert(alerts.SuccessFullySubmited);
      resetForm();
    } catch (error) {
      console.error('Temp Submit Error:', error);
      alert(alerts.catcherrors);
    }
  };

  const updatingFormTemp = async () => {
    try {
      if (!validateForm()) return;
      console.log('Updating Form:', formData);

      if (Number(formoneId) < 0) {
        const updatedTable = TransactionTable.map((tb: any) =>
          tb.id === tempdataUdapte ? { ...tb, ...formData } : tb
        );
        setTransactionTable(updatedTable);
        alert('Transaction updated successfully');
        console.log('Temp Transaction Updated:', updatedTable);
        resetForm();
      } else {
        await api.updateRecord(formoneId, listNames.FinalQuotaCreditUsageList, buildPayload);
        alert(alerts.SuccessFullySubmited);
        console.log('Updated Item on SharePoint:', buildPayload);

        const savedRows = await cls.fetchCurrentTransactions(Number(producerkey));
        const tempRows = TransactionTable.filter((tb: any) => tb.id < 0);


        const normalizedSavedRows = savedRows.map((item: any) => {
          const existing = TransactionTable.find((tb: any) => tb.ID === item.ID && tb?.ID == formoneId);
          return {
            ...item,
            Bc_checkbox: existing !== undefined && Object.keys(existing).length > 0 && formData.Bc_checkbox ? true : false
          };
        });
        setTransactionTable([...normalizedSavedRows, ...tempRows]);
        resetForm();
      }
    } catch (error) {
      console.error('Update Error:', error);
      alert(alerts.catcherrors);
    }
  };

  async function filterbyProducer(e: React.ChangeEvent<HTMLSelectElement>) {
    setTransactionTable([]);
    const value = e.target.value;
    setproducerkey(value);
    console.log('Filter by Producer:', value);

    const _currentData = await cls.fetchCurrentTransactions(Number(value));
    const _historicalData = await cls.fetchHistoricalUsageTransactions(Number(value));
    await cls.fetchHistoricalEarnedTransactions(Number(value));

    console.log('Filtered Current Data:', _currentData);
    console.log('Filtered Historical Data:', _historicalData);

    setTransactionTable(_currentData);
    setTransactionreportTable(_historicalData);
    setquotaCreditBalance(cls.fetchInitialQuotaofProducer());
  }

  async function filterbyquotacreadit(e: React.ChangeEvent<HTMLSelectElement>) {
    setquotaCreditkey(e.target.value);
    const _historicalData = await cls.fetchHistoricalUsageTransactions(Number(producerkey));
    console.log('Filtered by Quota Credit:', _historicalData);
    setTransactionreportTable(_historicalData);
  }


function openEditForm(item: any, id: any): void {
  setFormStatus('editing');
  setshowmodel(true);
  setformoneId(item?.ID ?? item.id);
  settempdataUdapte(`${id}`);

  const existing = TransactionTable.some((tb: any) => tb?.ID === item?.ID && item?.Bc_checkbox == true);
  const temp = TransactionTable.find((tb: any) => tb?.id === id && item?.Bc_checkbox == true);

  setFormData({
    Bc_Quota_Credit_Type: item?.Bc_Quota_Credit_Type ?? '',
    Bc_Quantity_per_Week: item?.Bc_Quantity_per_Week ?? '',
    Bc_Flock: item?.Bc_Flock ?? '',
    Bc_Application_Date: formatDate(item.Bc_Application_Date),
    Bc_Start_Date: item?.Bc_Start_Date ? formatDate(item.Bc_Start_Date) : '',
    Bc_End_Date: item?.Bc_End_Date ? formatDate(item.Bc_End_Date) : '',
    Bc_Description: item?.Bc_Description ?? '',
    Bc_checkbox: temp ?? existing
  });

  // Checkbox ko UI me enable/disable ke liye
  setEnableEndDate(temp?.Bc_checkbox ?? existing?.Bc_checkbox ?? false);

  console.log('Editing Form Data:', item);
}




  async function deletingitem(item: any, id: any) {
    try {

      const confirmed = window.confirm(alerts.deleteconfirm);
      if (!confirmed) return;

      if (id !== undefined && id !== null) {
        setTransactionTable((prev: any[]) => prev.filter(row => row.id !== id));
        return;
      }
      console.log('Deleting Item:', item);


      await api.deleteRecord(item?.ID, listNames.FinalQuotaCreditUsageList);
      setTransactionTable((prev: any[]) => prev.filter(row => row.ID !== item.ID));
      // alert(alerts.Deleterecord);
    } catch (error) {
      console.error('Delete Error:', error);
      alert(alerts.catcherrors);
    }
  }

  React.useEffect(() => {
    console.log('Transaction Table Updated:', TransactionTable);
  }, [TransactionTable]);



  return (
    <>
      {showmodel &&
        <div className="quota-modal-overlay" id="transactionModal">
          <div className="quota-modal">
            <h2>{formStatus === 'editing' ? 'Edit Quota Credit Usage Transaction' : 'Add Quota Credit Usage Transaction'}</h2>
            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Quota Credit Type <span>*</span></label>
                <select
                  name="Bc_Quota_Credit_Type"
                  value={formData.Bc_Quota_Credit_Type}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {QuotaCredittype?.map((item: any) => (
                    <option key={item.Id} value={item.SubType_x0020__x002d__x0020_Desc}>
                      {item.SubType_x0020__x002d__x0020_Desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quota-form-group">
                <label>Quantity per Week <span>*</span></label>
                <input
                  type="number"
                  name="Bc_Quantity_per_Week"
                  value={formData.Bc_Quantity_per_Week}
                  onChange={handleChange}
                  placeholder="Enter"
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Flock <span>*</span></label>
                <input
                  type="text"
                  name="Bc_Flock"
                  value={formData.Bc_Flock}
                  onChange={handleChange}
                  placeholder="Enter"
                />
              </div>

              <div className="quota-form-group">
                <label>Application Date <span>*</span></label>
                <input
                  type="date"
                  name="Bc_Application_Date"
                  min={getCurrentDate()}
                  value={formData.Bc_Application_Date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Start Date <span>*</span></label>
                <input
                  type="date"
                  name="Bc_Start_Date"
                  min={getCurrentDate()}
                  value={formData.Bc_Start_Date}
                  onChange={handleChange}
                />
              </div>

              <div className="quota-form-group">
                <label>End Date <span>*</span></label>
                <input
                  type="date"
                  name="Bc_End_Date"
                  min={getCurrentDate()}
                  value={formData.Bc_End_Date}
                  onChange={handleChange}
                  disabled={!enableEndDate}
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>13 weeks(s) and 0 days(0)</label>
              </div>

              <div className="quota-form-group checkbox-inline">
                <label>
                  {/* <input
                    type="checkbox"
                    checked={enableEndDate}
                    onChange={(e) => setEnableEndDate(e.target.checked)}
                  /> */}

                  <input
                    type="checkbox"
                    checked={formData.Bc_checkbox}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEnableEndDate(checked);
                      setFormData((prev: any) => ({
                        ...prev,
                        Bc_checkbox: checked
                      }));
                    }}
                  />

                  <span className="different-date">I would like to pick a different Date</span>
                </label>
              </div>
            </div>

            <div className="quota-form-group">
              <label>Description <span>*</span></label>
              <textarea
                name="Bc_Description"
                value={formData.Bc_Description}
                onChange={handleChange}
                placeholder="Enter"
              />
            </div>

            <div className="quota-modal-actions">
              <button className="btn-cancel" onClick={() => setshowmodel(false)}>Cancel</button>
              <button
                className={`btn-submit ${formStatus === "editing" ? 'updateone' : ''}`}
                onClick={formStatus === "submitting" ? insertRowTemp : updatingFormTemp}>
                {formStatus === "submitting" ? "Submit" : "Save"}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Producer & Transaction Filter + Action Buttons */}
      <div className="quota-form-row">
        <div className="quota-form-group">
          <label>Producers <span>*</span></label>
          <select value={producerkey} onChange={(e) => filterbyProducer(e)}>
            <option disabled selected>Select Producer</option>
            {Producers?.map((item: any) => (
              <option value={item?.ID}>{item?.Producer}</option>
            ))}
          </select>
        </div>

        <div className="quota-form-group">
          <label>Quota Credit Transaction Types <span>*</span></label>
          <select value={"Usage"} onChange={(e) => filterbyquotacreadit(e)}>
            {QuotaCredit?.map((item: any) => (
              <option value={item?.Title}>{item?.Title}</option>
            ))}
          </select>
        </div>

        <div className="btn-group">
          <button className="btn-cancel" onClick={handleAllCancel}>Cancel</button>
          <button className="btn-submit" onClick={handleAllSubmit}>Submit</button>
        </div>
      </div>

      <div className="card">
        <div className="balance-title">Total Quota Credit Usage Balance</div>

        <div className="balance-grid">
          <div className="balance-item">
            <div className="balance-label">Quota Credit Balance</div>
            <div className="balance-value">{quotaCreditBalance}</div>
          </div>

          <div className="balance-item">
            <div className="balance-label">Approval Pending Quota Credit</div>
            <div className="balance-value">{approvalPendingQuotaCredit}</div>
          </div>

          <div className="balance-item">
            <div className="balance-label">Actual Allowed Credit</div>
            <div className="balance-value">{actualAllowedCredit}</div>
          </div>
        </div>
      </div>

      {/* Quota Credit Transaction Table */}
      <div className="card">
        <div className="section-header">
          <h2>Quota Credit Transaction</h2>
          <button className="btn-add" onClick={openAddTransactionForm}>
            Add Transaction
          </button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quota Credit Type</th>
                <th>Quantity per Week</th>
                <th>Flock</th>
                <th>Application Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {TransactionTable?.map((item: any) => (
                <tr key={item.id}>
                  <td>{item?.Bc_Quota_Credit_Type}</td>
                  <td>{item?.Bc_Quantity_per_Week}</td>
                  <td>{item?.Bc_Flock}</td>
                  <td>{item?.Bc_Application_Date ? formatDateFromString(item.Bc_Application_Date) : ''}</td>
                  <td>{item?.Bc_Start_Date ? formatDateFromString(item.Bc_Start_Date) : ''}</td>
                  <td>{item?.Bc_End_Date ? formatDateFromString(item.Bc_End_Date) : ''}</td>
                  <td>{item?.Bc_Description}</td>
                  <td>
                    <div className="actions">
                      <span className="delete" onClick={() => deletingitem(item, item?.id)}>
                        <img src={deleteicon} alt="deleteicon" />
                      </span>
                      <span className="edit" onClick={() => openEditForm(item, item?.id)}>
                        <img src={editicon} alt="editicon" />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Report Table */}
      <div className="card">
        <h2>Transaction Report</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Quota Credit Type</th>
                <th>Total Quantity</th>
                <th>Quantity per Week</th>
                <th>Number of Weeks</th>
                <th>Quantity per Day</th>
                <th>Number of Days</th>
                <th>Flock</th>
                <th>Application Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Expiry Notified</th>
                <th>Description</th>
                <th>Transaction Complete Flag</th>
              </tr>
            </thead>
            <tbody>
              {TransactionreportTable?.map((item: any) => {
                return (
                  <tr>
                    <td>{item?.Id}</td>
                    <td>{item?.Bc_Transaction_Type}</td>
                    <td>{item?.bc_quantityPerWeek}</td>
                    <td>{item?.bc_quantityPerWeek}</td>
                    <td>{item.bc_endDate && item.bc_endDate ? weeksBetween(item.bc_startDate, item.bc_endDate) : ''}</td>
                    <td>{item?.bc_quantityPerDay}</td>
                    <td>{item.bc_startDate && item.bc_endDate ? daysBetween(item.bc_startDate, item.bc_endDate) : ''}</td>
                    <td>{item?.bc_flock}</td>
                    <td>{item?.Bc_Date ? formatDateFromString(item.Bc_Date) : ''}</td>
                    <td>{item?.bc_startDate ? formatDateFromString(item.bc_startDate) : ''}</td>
                    <td>{item?.bc_endDate ? formatDateFromString(item.bc_endDate) : ''}</td>
                    <td>{item?.field_19}</td>
                    <td>{item?.Bc_Comment}</td>
                    <td>{item?.field_10}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default QuotaCredit;
