import * as React from 'react';
import type { IQuotaCreditProps } from './IQuotaCreditProps';
import './style.css'
import { ApiService } from '../../services/apiservices';
import { alerts, listNames, status } from '../../common/constants/ListNames';
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
    QuotaCreditType: '',
    QuantityperWeek: '',
    Flock: '',
    ApplicationDate: getCurrentDate(),
    StartDate: '',
    EndDate: '',
    Description: ''
  });
  let subtype = React.useRef('');
  const [TransactionTable, setTransactionTable]: any = React.useState([]);
  const [TransactionreportTable, setTransactionreportTable]: any = React.useState([]);
  const [producerkey, setproducerkey]: any = React.useState('');
  const [quotaCreditkey, setquotaCreditkey]: any = React.useState('');
  const [formoneId, setformoneId]: any = React.useState(0);
  const [quotaCreditBalance, setquotaCreditBalance]: any = React.useState(0);
  const [enableEndDate, setEnableEndDate] = React.useState(false);
  const [formStatus, setFormStatus] = React.useState<'editing' | 'submitting'>('submitting');

  const api = new ApiService(context)
  const cls = new TransactionService(context)

  /* ===================== INIT ===================== */
  React.useEffect(() => {
    const produceritems = async () => {
      const user = await api.getCurrentUser();
      const producerdowndataf = await api.filterListItems(
        listNames.ProducerInformation,
        `BCEggAccount/Id eq ${user.Id}`,
        "*"
      );

      let quotaCreditdowndata = await api.filterListItems(
        listNames.QuotaCreditType,"LinkTitle eq 'Usage'",
        'Title'
      );

      let quotaCreditTypedowndata = await api.filterListItems(
        listNames.QuotaCreditTypes,
        "TransactionCategory eq 'Usage'",
        'Id,Title,Subtype,SubType_x0020__x002d__x0020_Desc'
      );

      setProducers(producerdowndataf);
      setQuotaCredit(quotaCreditdowndata);
      setQuotaCredittype(quotaCreditTypedowndata);
      setproducerkey(producerdowndataf?.[0]?.ID);
      console.log(quotaCreditkey)

      const currentData = await cls.fetchCurrentTransactions(Number(producerdowndataf?.[0]?.ID));
      const historicalData = await cls.fetchHistoricalTransactions(Number(producerdowndataf?.[0]?.ID));

      setquotaCreditBalance(cls.fetchInitialQuotaofProducer(producerdowndataf, Number(producerdowndataf?.[0]?.ID)));
      setTransactionTable(currentData);
      setTransactionreportTable(historicalData);
    };

    produceritems();
  }, []);

  const calculateEndDate = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 91);
    return formatDate(date)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'StartDate') {
      const endDate = calculateEndDate(value);
      setFormData((prev: any) => ({ ...prev, StartDate: value, EndDate: endDate }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }

    if (name === "QuotaCreditType") {
      let qtype = QuotaCredittype?.filter((item: any) => item?.Id === Number(value));
      subtype.current = qtype?.[0]?.Title
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'QuotaCreditType',
      'QuantityperWeek',
      'Flock',
      'ApplicationDate',
      'StartDate',
      'EndDate',
      'Description'
    ];
    const emptyField = requiredFields.find((field) => !formData[field]);
    if (emptyField) {
      alert(`${alerts.RequiredFields} ${emptyField}`);
      return false;
    }
    return true;
  };
  const buildPayload = cls.Formpayload(formData, producerkey, status);


  const resetForm = () => {
    setFormData({
      QuotaCreditType: '',
      QuantityperWeek: '',
      Flock: '',
      ApplicationDate: getCurrentDate(),
      StartDate: '',
      EndDate: '',
      Description: ''
    });
    setshowmodel(false);
    setFormStatus('submitting');
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      await api.insertRecord(listNames.FinalQuotaCreditUsageList, buildPayload);
      alert(alerts.SuccessFullySubmited);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(alerts.catcherrors);
    }
  };

  const updatingForm = async () => {
    try {
      if (!validateForm()) return;

      await api.updateRecord(formoneId, listNames.FinalQuotaCreditUsageList, buildPayload);
      alert(alerts.SuccessFullySubmited);
        if (producerkey) {
      const updatedData = await cls.fetchCurrentTransactions(Number(producerkey));
      setTransactionTable(updatedData);
    }
      resetForm();
    } catch (error) {
      console.error(error);
      alert(alerts.catcherrors);
    }
  };


    async function filterbyProducer(e: React.ChangeEvent<HTMLSelectElement>) {
    setTransactionTable([]);
    const value = e.target.value;
    setproducerkey(value);

    const _currentData = await cls.fetchCurrentTransactions(Number(value));
    const _historicalData = await cls.fetchHistoricalTransactions(Number(value));
    setTransactionTable(_currentData);
    setTransactionreportTable(_historicalData);
    setquotaCreditBalance(cls.fetchInitialQuotaofProducer(Producers, Number(value)));
  }

  async function filterbyquotacreadit(e: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
    setquotaCreditkey(e.target.value);
    setTransactionreportTable([]);
    const _historicalData = await cls.fetchHistoricalTransactions(Number(producerkey));
    setTransactionreportTable(_historicalData);
  }

  function openEditForm(item: any): void {
    setFormStatus('editing');
    setshowmodel(true);
    setformoneId(item?.ID);
    setFormData({
      QuotaCreditType: item?.Bc_Quota_Credit_Type,
      QuantityperWeek: item?.Bc_Quantity_per_Week,
      Flock: item?.Bc_Flock,
      ApplicationDate: formatDate(item?.Bc_Application_Date),
      StartDate: formatDate(item?.Bc_Start_Date),
      EndDate: formatDate(item?.Bc_End_Date),
      Description: item?.Bc_Description ?? ''
    });
  }

  async function deletingitem(item: any) {
    // await api.deleteRecord(item?.ID,'' );
    // alert(alerts.Deleterecord)
  }



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
                  name="QuotaCreditType"
                  value={formData.QuotaCreditType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {QuotaCredittype?.map((item: any) => (
                    <option
                      key={item.Id}
                      value={item.SubType_x0020__x002d__x0020_Desc}
                    >
                      {item.SubType_x0020__x002d__x0020_Desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quota-form-group">
                <label>Quantity per Week <span>*</span></label>
                <input
                  type="number"
                  name="QuantityperWeek"
                  value={formData.QuantityperWeek}
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
                  name="Flock"
                  value={formData.Flock}
                  onChange={handleChange}
                  placeholder="Enter"
                />
              </div>

              <div className="quota-form-group">
                <label>Application Date <span>*</span></label>
                <input
                  type="date"
                  name="ApplicationDate"
                  value={formData.ApplicationDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Start Date <span>*</span></label>
                <input
                  type="date"
                  name="StartDate"
                  value={formData.StartDate}
                  onChange={handleChange}
                />
              </div>

              <div className="quota-form-group">
                <label>End Date <span>*</span></label>
                <input
                  type="date"
                  name="EndDate"
                  value={formData.EndDate}
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
                  <input
                    type="checkbox"
                    checked={enableEndDate}
                    onChange={(e) => setEnableEndDate(e.target.checked)}
                  />
                  <span>I would like to pick a different Date</span>
                </label>
              </div>
            </div>
            <div className="quota-form-group">
              <label>Description <span>*</span></label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="Enter"
              />
            </div>

            <div className="quota-modal-actions">
              <button className="btn-cancel" onClick={() => setshowmodel(false)}>
                Cancel
              </button>

              <button
                className={`btn-submit ${formStatus === "editing" ? 'updateone' : ''}`}
                onClick={formStatus === "submitting" ? handleSubmit : updatingForm}>
                {formStatus === "submitting" ? "Submit" : "Save"}
              </button>

            </div>

          </div>
        </div>


      }


      <div className="quota-form-row">
        <div className="quota-form-group">
          <label>Producers <span>*</span></label>
          <select value={producerkey} onChange={(e) => filterbyProducer(e)}>

            <option disabled selected>Select Producer</option>
            {Producers?.map((item: any) => {
              return (
                <option value={item?.ID}>{item?.Producer}</option>
              )
            })}
          </select>
        </div>

        <div className="quota-form-group">
          <label>Quota Credit Transaction Types <span>*</span></label>
          <select value={"Usage"} onChange={(e) => filterbyquotacreadit(e)}>
            {/* <option disabled selected>Select Quota Credit</option> */}
            {QuotaCredit?.map((item: any) => {
              return (
                <option value={item?.Title}>{item?.Title}</option>
              )
            })}
          </select>
        </div>
        <div className="btn-group">
          <button className="btn-cancel">Cancel</button>
          <button className="btn-submit">Submit</button>
        </div>
      </div>

      <div className="card">
        <div className="balance-title">Total Quota Credit Usage Balance</div>
        <div className="balance-label">Quota Credit Balance</div>
        <div className="balance-value">{quotaCreditBalance}</div>
      </div><div className="card">
        <div className="section-header">
          <h2>Quota Credit Transaction</h2>
          <button className="btn-add" onClick={() => {
            setFormStatus('submitting');
            setFormData({
              QuotaCreditType: '',
              QuantityperWeek: '',
              Flock: '',
              ApplicationDate: getCurrentDate(),
              StartDate: '',
              EndDate: '',
              Description: ''
            });
            setshowmodel(prev => !prev);
          }}>
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
              {TransactionTable?.map((item: any) => {
                return (
                  <tr>
                    <td>{item?.Bc_Quota_Credit_Type}</td>
                    <td>{item?.Bc_Quantity_per_Week}</td>
                    <td>{item?.Bc_Flock}</td>
                    <td>{item?.Bc_Application_Date ? formatDateFromString(item.Bc_Application_Date) : ''}</td>
                    <td>{item?.Bc_Start_Date ? formatDateFromString(item.Bc_Start_Date) : ''}</td>
                    <td>{item?.Bc_End_Date ? formatDateFromString(item.Bc_End_Date) : ''}</td>
                    <td>{item?.Bc_Description}</td>
                    <td>
                      <div className="actions">
                        <span className="delete" onClick={() => deletingitem(item)}><img src={deleteicon} alt="deleteicon" /></span>
                        <span className="edit" onClick={() => openEditForm(item)}><img src={editicon} alt="editicon" /></span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div><div className="card">
        <h2 style={{ marginBottom: '15px' }}>Quota Credit Usage Transactions Report</h2>

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
                    <td>{weeksBetween(item.bc_startDate, item.bc_endDate)}</td>
                    <td>{item?.bc_quantityPerDay}</td>
                    <td>{daysBetween(item.bc_startDate, item.bc_endDate)}</td>
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
      </div></>
  )
}

export default QuotaCredit
