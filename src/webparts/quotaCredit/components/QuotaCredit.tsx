import * as React from 'react';
import type { IQuotaCreditProps } from './IQuotaCreditProps';
import './style.css'
import { ApiService } from '../../services/apiservices';
import { alerts, listNames } from '../../common/constants/ListNames';
// import { ICamlQuery, sp } from '@pnp/sp/presets/all';
import { TransactionService } from '../../business/transactionservice';
// import { map } from 'lodash';
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
    ApplicationDate: new Date().toISOString().split('T')[0],
    StartDate: '',
    EndDate: '',
    Description: ''
  });
  let subtype = React.useRef('');
  const [TransactionTable, setTransactionTable]: any = React.useState([]);
  const [TransactionreportTable, setTransactionreportTable]: any = React.useState([]);
  const [producerkey, setproducerkey]: any = React.useState('');
  const [quotaCreditkey, setquotaCreditkey]: any = React.useState('');
  // const [editingform, seteditingform]: any = React.useState(false);
  const [formoneId, setformoneId]: any = React.useState(0);
  const [quotaCreditBalance, setquotaCreditBalance]: any = React.useState(0);
const [enableEndDate, setEnableEndDate] = React.useState(false);
const [formStatus, setFormStatus] = React.useState<'editing' | 'submitting'>('submitting');


  const api = new ApiService(context)
  const cls = new TransactionService(context)


  React.useEffect(() => {

    const produceritems = async () => {
      const user = await api.getCurrentUser();
      const producerdowndataf = await api.filterListItems(listNames.ProducerInformation, `BCEggAccount/Id eq ${user.Id}`, "*");
      
      console.log(producerdowndataf, 'prd')
      //     const producerdowndata: ICamlQuery = {
      //       ViewXml: `
      //   <View>
      //     <Query>
      //       <Where>
      //         <Includes>
      //           <FieldRef Name="BCEggAccount" LookupId="TRUE" />
      //           <Value Type="Integer">${user.Id}</Value>
      //         </Includes>
      //       </Where>
      //     </Query>
      //   </View>
      // `
      //     };
      //     const producerdowndatafinal = await sp.web.lists
      //       .getByTitle(listNames.ProducerInformation)
      //       .getItemsByCAMLQuery(producerdowndata);


      let quotaCreditdowndata = await api.getListItems(listNames.QuotaCreditType, 'Title');
      let quotaCreditTypedowndata = await api.filterListItems(listNames.QuotaCreditTypes,"TransactionCategory eq 'Usage'", 
        'Id,Title,Subtype,SubType_x0020__x002d__x0020_Desc');

      setProducers(producerdowndataf);
      setQuotaCredit(quotaCreditdowndata);
      setQuotaCredittype(quotaCreditTypedowndata);
      //default selected 
//setquotaCreditkey(quotaCreditdowndata?.[0]?.Title);
console.log(quotaCreditkey)
      setproducerkey(producerdowndataf?.[0]?.ID);
      setquotaCreditBalance(TransactionService.fetchInitialQuotaofProducer(producerdowndataf,Number(producerdowndataf?.[0]?.ID)));
      let data = await cls.fetchCurrentTransactions(producerdowndataf?.[0]?.Title)
      let data2 = await cls.fetchHistoricalTransactions(quotaCreditdowndata?.[0]?.Title, producerdowndataf?.[0]?.Title);
      setTransactionTable(data)
      
      setTransactionreportTable(data2)
    };
    produceritems();

  }, [])

  const calculateEndDate = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 91);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'StartDate') {
      const endDate = calculateEndDate(value);

      setFormData((prev: any) => ({
        ...prev,
        StartDate: value,
        EndDate: endDate
      }));
    }
    else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
    if (name === "QuotaCreditType") {
      let qtype = QuotaCredittype?.filter((item: any) => item?.Id === Number(value));
      console.log(qtype, 'qtype');
      subtype.current = qtype?.[0]?.Title


    }
  };

  async function updatingform(){
    alert('its working');
    return;
    await api.updateRecord(formoneId,listNames.FinalQuotaCreditUsageList,{
      ...formData
    });
    alert(alerts.SuccessFullySubmited)
  }

  const handleSubmit = async () => {
    try {
      const requiredFields = [
        'QuotaCreditType',
        'QuantityperWeek',
        'Flock',
        'ApplicationDate',
        'StartDate',
        'EndDate',
        'Description'
      ];

      const emptyField = requiredFields.find((field: any) => !formData[field]);
      if (emptyField) {
        alert(`${alerts.RequiredFields} ${emptyField}`);
        return;
      }
      const payload: any = {
        Bc_Quota_Credit_Type: "Short Placement",
        Bc_Quantity_per_Week: formData.QuantityperWeek,
        Bc_Flock: formData.Flock,
        Bc_Application_Date: formData.ApplicationDate,
        Bc_Start_Date: formData.StartDate,
        Bc_End_Date: formData.EndDate,
        Bc_Description: formData.Description,
        Bc_producerIDId:Number(producerkey)
      };
      await api.insertRecord(
        listNames.FinalQuotaCreditUsageList,
        payload
      );
      alert(alerts.SuccessFullySubmited);

      setFormData({
        QuotaCreditType: '',
        QuantityperWeek: '',
        Flock: '',
        ApplicationDate: '',
        StartDate: '',
        EndDate: '',
        Description: ''
      });
      setshowmodel(false);
    } catch (error) {
      console.error(error);
      alert(alerts.catcherrors);
    }
  };

  async function filterbyProducer(e: React.ChangeEvent<HTMLSelectElement>) {
    setTransactionTable([])
     let value = e.target.value;
    setproducerkey(value);
    setquotaCreditBalance(TransactionService.fetchInitialQuotaofProducer(Producers,Number(value)));
    let data = await cls.fetchCurrentTransactions(value);
    setTransactionTable(data);
    
  }

  async function filterbyquotacreadit(e: React.ChangeEvent<HTMLSelectElement>): Promise<void> {
    setquotaCreditkey(e.target.value)
    setquotaCreditkey('');
    setTransactionreportTable([])
    let data2 = await cls.fetchHistoricalTransactions(e.target.value, producerkey);
    setTransactionreportTable(data2)
  }


  function Edidintgform(item: any): void {
    setFormStatus('editing');
    setshowmodel(true);
    console.log(item, 't1');
    setformoneId(0)
    const formatDate = (date: any) =>
      date ? new Date(date).toISOString().split('T')[0] : '';



  //     setFormData({
  //   QuotaCreditType: item?.Bc_Quota_Credit_Type + ' - ' + item?.Bc_Description,
  //   QuantityperWeek: item?.Bc_Quantity_per_Week ?? '',
  //   Flock: item?.Bc_Flock ?? '',
  //   ApplicationDate: formatDate(item?.Bc_Application_Date),
  //   StartDate: formatDate(item?.Bc_Start_Date),
  //   EndDate: formatDate(item?.Bc_End_Date),
  //   Description: item?.Bc_Description ?? ''
  // });
  setFormData({
  QuotaCreditType:
    item?.Bc_Quota_Credit_Type,
  QuantityperWeek: item?.Bc_Quantity_per_Week,
  Flock: item?.Bc_Flock,
  ApplicationDate: formatDate(item?.Bc_Application_Date),
  StartDate: formatDate(item?.Bc_Start_Date),
  EndDate: formatDate(item?.Bc_End_Date),
  Description: item?.Bc_Description ?? ''
});

    setformoneId(item?.ID)
  }

  async function deletingitem(item:any){
    alert(item?.ID)
    return;
    await api.deleteRecord(item?.ID,listNames.FinalQuotaCreditUsageList)
  }

  


  return (
    <>
      {showmodel &&
        <div className="quota-modal-overlay" id="transactionModal">
          <div className="quota-modal">

            <h2>Add Quota Credit Usage Transaction</h2>

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
                onClick={formStatus === "submitting" ? handleSubmit : updatingform}>
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

            <option disabled selected>Select Procedure</option>
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
            setFormStatus('submitting')
            setshowmodel(prev => !prev)
            
            }}>Add Transaction</button>
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
                    <td>{item?.Bc_Application_Date ? new Date(item.Bc_Application_Date).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.Bc_Start_Date ? new Date(item.Bc_Start_Date).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.Bc_End_Date ? new Date(item.Bc_End_Date).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.Bc_Description}</td>
                    <td>
                      <div className="actions">
                        <span className="delete" onClick={()=> deletingitem(item)}><img src={deleteicon} alt="deleteicon" /></span>
                        <span className="edit" onClick={() => Edidintgform(item)}><img src={editicon} alt="editicon" /></span>
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
                    <td>{item?.field_10}</td>
                    <td>{item?.field_2}</td>
                    <td>{item?.field_8}</td>
                    <td>{item?.field_4}</td>
                    <td>{item?.field_11}</td>
                    <td>{item?.field_26}</td>
                    <td>{item?.field_23}</td>
                    <td>{item?.field_23}</td>
                    <td>{item?.field_5 ? new Date(item.field_5).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.field_27 ? new Date(item.field_27).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.field_15 ? new Date(item.field_15).toLocaleDateString("en-US") : ''}</td>
                    <td>{item?.field_19}</td>
                    <td>{item?.field_6}</td>
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
