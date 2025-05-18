import { FiShoppingBag, FiCreditCard, FiStar, FiShoppingCart } from 'react-icons/fi';
import { BsKanban, BsBoxSeam, BsCurrencyDollar, BsShield, BsChatLeft, BsFlower1 } from 'react-icons/bs';
import { IoIosColorPalette } from 'react-icons/io';
import {  RiCustomerService2Fill } from 'react-icons/ri';
import { MdAgriculture, MdLandslide, MdOutlineSupervisorAccount } from 'react-icons/md';
import { TiTick } from 'react-icons/ti';
import { GiChemicalTank, GiFertilizerBag, GiMedicinePills, GiPlantRoots, GiPlantSeed, GiPlantWatering } from 'react-icons/gi';
import { TbPlant2 } from "react-icons/tb";
import { LuWarehouse } from "react-icons/lu";


export const employeesGrid = [
  
  { field: 'name',
    headerText: 'Name',
    width: '0',
    textAlign: 'Center',
  },
  { field: 'isLocal',
    headerText: 'Is Local?',
    width: '170',
    textAlign: 'Center',
  },
  { field: 'codePhoneNumber',
    headerText: 'Code',
    width: '125',
    textAlign: 'Center' },
  {field: 'phoneNumber',
    headerText: 'Phone Number',
    width: '150',
    textAlign: 'Center',
  },

  
];

export const mainLandsGrid = [
  { headerText: 'Tarla Ad',
    field: 'title',
    width: '150',
    textAlign: 'Center',
    placeholder:'Name',
  },
  { field: 'location',
    headerText: 'Konum',
    width: '170',
    textAlign: 'Center',
    placeholder:'Location',
  },
  {
    field: 'size',
    headerText: 'Boyut',
    format: 'C2',
    textAlign: 'Center',
    editType: 'numericedit',
    width: '150',
    placeholder:'Size',
  },
];

export const links = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'mainPage',
        icon: <FiShoppingBag />,
      },
      {
        name: 'Tarlalar',
        icon: <MdLandslide />,
      },
    ],
  },

  {
    title: 'Products',
    links: [
      {
        name: 'Gübre',
        icon: <GiFertilizerBag />,
      },
      {
        name: 'ilaç',
        icon: <GiMedicinePills />,
      },
      {
        name: 'Fide',
        icon: <GiPlantSeed />,
      },
      {
        name: 'Renkler',
        icon: <IoIosColorPalette />,
      },

      {
        name: 'Gübre-mix',
        icon: <GiChemicalTank />,
      },

      {
        name: 'ilaç-mix',
        icon: <GiChemicalTank />,
      },
      
    ],
  },
  {
    title: 'Pages',
    links: [
      {
        name: 'ilaç-oygulama',
        icon: <GiPlantWatering />,
      },
      {
        name: 'Gübre-oygulama',
        icon: <MdAgriculture />,
      },
      {
        name: 'Fide-oygulama',
        icon: <GiPlantRoots />,
      },
      {
        name: 'Çiçek',
        icon: <TbPlant2 />,
      },
    ],
  },
  {
    title: 'Apps',
    links: [
      
      {
        name: 'mix-Gübre-oygulama',
        icon: <BsKanban />,
      },
      {
        name: 'mix-ilaç-oygulama',
        icon: <BsKanban />,
      },
      
    ],
  },
  {
    title: 'Depots',
    links: [
      {
        name: 'ilaç-depo',
        icon: <LuWarehouse />,
      },
      {
        name: 'ilaç-Stok-işlemleri',
        icon: <LuWarehouse />,
      },
      {
        name: 'Gübre-depo',
        icon: <LuWarehouse />,
      },
      {
        name: 'Gübre-Stok-işlemleri',
        icon: <LuWarehouse />,
      },
      {
        name: 'Çiçek-depo',
        icon: <LuWarehouse />,
      },
    ],
  },
  {
    title: 'Buy Manage',
    links: [
      {
        name: 'customer',
        icon: <RiCustomerService2Fill />,
      },
      {
        name: 'order',
        icon: <FiShoppingCart />,
      },
      
    ],
  },
  
];




export const earningData = [
  {
    icon: <MdOutlineSupervisorAccount />,
    title: 'Customers',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
    pcColor: 'red-600',
  },
  {
    icon: <BsBoxSeam />,
    title: 'Orders',
    iconColor: 'rgb(255, 244, 229)',
    iconBg: 'rgb(254, 201, 15)',
    pcColor: 'green-600',
  },
  {
    icon: <BsFlower1 />,
    title: 'Flower per Donum',
    iconColor: 'rgb(228, 106, 118)',
    iconBg: 'rgb(255, 244, 229)',

    pcColor: 'green-600',
  },
  
];



export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];



export const fertilizersGrid = [
  {
    field: 'title',
    headerText: 'Bilimsel Adı',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Scientific Name'
  },
  {
    field: 'publicTitle',
    headerText: 'Ad',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Name'
  },
  {
    field: 'npk',
    headerText: 'NPK',
    format: 'C2',
    textAlign: 'Center',
    editType: 'numericedit',
    width: '150',
    placeholder:'00-00-00'

  },
  {
    field: 'description',
    headerText: 'Tanım',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'About'

  },
];

export const insecticidesGrid = [
  {
    field: 'title',
    headerText: 'Bilimsel Adı',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Scientific Name'
  },
  {
    field: 'publicTitle',
    headerText: 'Ad',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Name'
  },
  {
    field: 'type',
    headerText: 'Tür',
    textAlign: 'Center',
    editType: 'dropdownedit', 
    width: '150',
    options: [
      {value: 0, label: "Sıvı ilaç"},
      {value: 1, label: "Toz ilaç"}
    ],
    editParams: {
      params: {
        dataSource: [
          {value: 0, text: "Sıvı ilaç"},
          {value: 1, text: "Toz ilaç"}
        ],
        fields: { text: 'text', value: 'value' }
      }
    },
    template: (data) => {
      const selectedOption = insecticidesGrid.find(col => col.field === 'type')
      ?.options.find(opt => opt.value === data.type);
      return selectedOption ? selectedOption.label : data.type;
    }
  } ,
  {
    field: 'description',
    headerText: 'Tanım',
    width: '150',
    editType: 'dropdownedit',
    
    textAlign: 'Center',
    placeholder:'About'

  },
];

export const cuttingsGrid = [
  {
    field: 'title',
    headerText: 'Ad',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Name'
  },
  {
    field: 'type',
    headerText: 'Tür',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Type'
  },
  {
    field: 'age',
    headerText: 'Yaş',
    format: 'C2',
    textAlign: 'Center',
    editType: 'numericedit',
    width: '150',
    placeholder:'Age'

  },
];

export const colorsGrid = [
  {
    field: 'title',
    headerText: 'Ad',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Name'
  },
  {
    field: 'code',
    headerText: 'Code',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
    placeholder:'Code'
  },
  
];

export const flowersGrid = [
  {
    headerText: 'ID',
    field: 'id',
    width: '50',
    textAlign: 'Center',
    type: 'number'
  },
  {
    headerText: 'Title',
    field: 'id',
    width: '150',
    textAlign: 'Center',
  },
  {
    headerText: 'Worker',
    field: 'worker',
    width: '150',
    textAlign: 'Center'
  },
  {
    headerText: 'Date',
    field: 'date',
    width: '150',
    format: 'yMd',
    textAlign: 'Center',
    type: 'date'
  },
  {
    headerText: 'Flowers Data',
    field: 'flowers',
    width: '200',
    textAlign: 'Center'
  },
  
  
];


