import React, {useState} from "react";
import { GetStaticProps } from 'next'
import {Button, Container, Grid, Paper} from "@mui/material";
import {FileUtil} from "../src/util/FileUtil";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export const getStaticProps: GetStaticProps = async (context) => {
  let paths = FileUtil.getUsers()
  console.log(paths)
  return {
    props: {title:"Available files", data: paths},
  }
}

export default class FileOverview extends React.Component<{data: any}, any> {

  constructor(params) {
    super(params);
    this.state = {}
  }

  getItems() {
    let items = [];
    for (let user in this.props.data) {
      items.push(<UserLogContainer key={user} userName={user} dates={this.props.data[user]} />)
    }
    return items;
  }


  render() {
    return (
      <Grid container flexDirection={'column'}>
        <h1>Available Log files</h1>
        { this.getItems() }
      </Grid>

    );
  }

}

function UserLogContainer(props) {
  let [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Grid container flexDirection={"column"} ml={5}>
        <Grid item onClick={() => { setOpen(!open); }}>
          <Button variant="contained" startIcon={<ArrowRightIcon />}>
            {props.userName}
          </Button>
        </Grid>
      </Grid>
    )
  }
  else {
    return (
      <Grid container flexDirection={"column"} ml={5}>
        <Grid item onClick={() => { setOpen(!open); }}>
          <Button variant="outlined" startIcon={<ArrowDropDownIcon />}>
            {props.userName}
          </Button>
        </Grid>
        {props.dates.map((date) => { return (
          <Grid key={date} item onClick={() => { console.log("SELETED", date)}} ml={2}>
            <Button variant="text" startIcon={<ArrowRightIcon />}>
              {date}
            </Button>
          </Grid>
        )
        })}
      </Grid>
    );
  }
}