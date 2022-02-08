import {colors} from "../../styles/colors";
import {Button, Checkbox, FormControlLabel, FormGroup, Grid, TextField} from "@mui/material";
import React, {useState} from "react";
import { AnimatedGrid } from "../animating/AnimatedGrid";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export function FileSelection({phase, selectFile, streamValue}) {
  let [ path, setPath ] = useState('')
  let [ stream, setStream ] = useState(streamValue)

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
          <FormGroup>
            <FormControlLabel control={<Checkbox
              checked={stream}
              onChange={(event) => {
                setStream(event.target.value);
              }}
              inputProps={{ 'aria-label': 'controlled' }}
            />} label="Streaming (auto-refresh)" />
          </FormGroup>
          <Button variant="contained" startIcon={<ArrowRightIcon />} onClick={() => { selectFile(path, stream); }}>
            {"START"}
          </Button>
        </Grid> : <div />
      }
    </AnimatedGrid>
  )
}



