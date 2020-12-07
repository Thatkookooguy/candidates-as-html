import express from 'express';
import axios from 'axios';
import { chain } from 'lodash';

const app = express();
const PORT = 8088;
const clientFolder = 'dist/client';

app.get('/api/candidates', async (req, res) => {
    const resumeDataRes = await axios.get('https://hs-resume-data.herokuapp.com/v3/candidates/all_data_b1f6-acde48001122');
    const data: any[] = resumeDataRes.data;

    parseCandidates(data);
    
    res.json(data);
});

// ---- SERVE STATIC FILES ---- //
app.get('*.*', express.static(clientFolder, {maxAge: '1y'}));

// ---- SERVE APLICATION PATHS ---- //
app.all('*', function (req, res) {
    res.status(200).sendFile(`/`, {root: clientFolder});
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

function parseCandidates(candidates: any[]) {
  candidates.forEach((candidate) => {
    const experience  = chain(candidate.experience || []).sortBy((exp) => exp.start_date).reverse().value();
    const result = [];

    let lastEndDate = null;
    for (let i = experience.length - 1; i >= 0; i--) {
      const job = experience[i];
      const startDate = new Date(job.start_date);

      const diff = lastEndDate ? startDate.getTime() - (lastEndDate as Date).getTime() : 0;
      const diffInDays = diff / (1000 * 3600 * 24);
      const diffInYears = Math.round(diffInDays / 365);
      const diffInMonths = Math.round(diff / (1000 * 60 * 60 * 24 * 7 * 4));

      if (diffInDays >= 365) {
        result.push({
          type: 'gap',
          value: diffInYears,
          kind: 'years'
        });
      } else if (diffInDays >= 31 && diffInDays < 365) {
        result.push({
          type: 'gap',
          value: diffInMonths,
          kind: 'months'
        });
      } else if (diffInDays > 1 && diffInDays < 31) {
        result.push({
          type: 'gap',
          value: diffInDays,
          kind: 'days'
        });
      }

      result.push(job);
      lastEndDate = new Date(job.end_date);
    }

    candidate.experience = result;
  });
}