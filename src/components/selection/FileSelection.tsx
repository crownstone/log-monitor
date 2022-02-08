import {colors} from "../../styles/colors";
import {Button, Grid, TextField} from "@mui/material";
import React, {useState} from "react";
import { AnimatedGrid } from "../animating/AnimatedGrid";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export function FileSelection({phase, selectFile}) {
  let [ path, setPath ] = useState('')

  return (
    <AnimatedGrid item style={{minHeight: '100vh', maxWidth: '40vw', flex: phase === 0 ? 1 : 0, backgroundColor: phase === 0 ? colors.white.hex : colors.green.hex}}>
      {
        phase === 0 ? <Grid style={{padding:10}}>
          <h1>Put the absolute path the file here:</h1>
          <TextField
            label="file path"
            variant="outlined"
            style={{width: 800}}
            value={path}
            onChange={(event) => {
              setPath(event.target.value);
            }}
          />
          <br />
          <br />
          <Button variant="contained" startIcon={<ArrowRightIcon />} onClick={() => { selectFile(path); }}>
            {"START"}
          </Button>
        </Grid> : <div />
      }
    </AnimatedGrid>
  )
}



