import pandas as pd
import json
import os
import sys
import re
import numpy as np
import uuid

# V4

cpuBench = pd.read_csv('data/benchmarks/CPU_benchmark_v4.csv')
chipsets = pd.read_csv('data/processed-data/Chipset.csv')

splitname = cpuBench['cpuName'].str.split(' ', n=1, expand=True)
cpuBench['manufacturer'] = splitname[0]
cpuBench['model'] = splitname[1]
cpuBench = cpuBench.merge(chipsets[['Name', 'ChipsetID']], left_on='model', right_on='Name', how='inner')
cpuBench = cpuBench.drop(columns=['Name'])
cpuBench = cpuBench.rename(columns={'cpuMark': 'CPUMark', 'threadMark': 'ThreadMark', 'socket': 'Socket'})
benchmarksCPU = pd.DataFrame(columns=['BenchmarkID', 'ChipsetID', 'Type', 'Score'])

for index, row in cpuBench.iterrows():
    chipset_id = row['ChipsetID']
    
    cpumark_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'CPUMark',
        'Score': row['CPUMark']
    }
    
    threadmark_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'ThreadMark',
        'Score': row['ThreadMark']
    }
    
    benchmarksCPU = benchmarksCPU._append(cpumark_entry, ignore_index=True)
    benchmarksCPU = benchmarksCPU._append(threadmark_entry, ignore_index=True)

# R23

cpuBenchR = pd.read_csv('data/benchmarks/CPU_r23_v2.csv')
chipsets = pd.read_csv('data/processed-data/Chipset.csv')

cpuBenchR['cpuName'] = cpuBenchR['cpuName'].str.replace(r'i([3|5|7|9])', r'i\1-', regex=True)
cpuBenchR['cpuName'] = cpuBenchR['cpuName'].str.replace('- ', '-', regex=True)
cpuBenchR = cpuBenchR.merge(chipsets[['Name', 'ChipsetID']], left_on='cpuName', right_on='Name', how='inner')
cpuBenchR = cpuBenchR.drop(columns=['Name'])
cpuBenchR = cpuBenchR.rename(columns={'singleScore': 'R23SingleScore', 'multiScore': 'R23MultiScore'})

for index, row in cpuBenchR.iterrows():
    chipset_id = row['ChipsetID']
    
    single_score_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'R23SingleScore',
        'Score': row['R23SingleScore']
    }
    
    benchmarksCPU = benchmarksCPU._append(single_score_entry, ignore_index=True)

    multi_score_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'R23MultiScore',
        'Score': row['R23MultiScore']
    }
    
    benchmarksCPU = benchmarksCPU._append(multi_score_entry, ignore_index=True)

# PassMark

cpuBenchP1 = pd.read_csv('data/benchmarks/HighEnd-2023-10-5-cpu.csv')
cpuBenchP2 = pd.read_csv('data/benchmarks/LowEnd-2023-10-5-cpu.csv')
cpuBenchP3 = pd.read_csv('data/benchmarks/LowMid-2023-10-5-cpu.csv')
cpuBenchP4 = pd.read_csv('data/benchmarks/MidHigh-2023-10-5-cpu.csv')
cpuBenchP = pd.concat([cpuBenchP1, cpuBenchP2, cpuBenchP3, cpuBenchP4], ignore_index=True)
chipsets = pd.read_csv('data/processed-data/Chipset.csv')

splitname = cpuBenchP['cpuName'].str.split(' ', n=1, expand=True)
cpuBenchP['manufacturer'] = splitname[0]
cpuBenchP['model'] = splitname[1]
cpuBenchP = cpuBenchP.merge(chipsets[['Name', 'ChipsetID']], left_on='model', right_on='Name', how='inner')
cpuBenchP = cpuBenchP.drop(columns=['Name'])

for index, row in cpuBenchP.iterrows():
    chipset_id = row['ChipsetID']
    
    single_score_entry = {
        'BenchmarkID': str(uuid.uuid4()),
        'ChipsetID': chipset_id,
        'Type': 'PassMark',
        'Score': row['PassMark']
    }
    
    benchmarksCPU = benchmarksCPU._append(single_score_entry, ignore_index=True)


benchmarksCPU[['BenchmarkID', 'ChipsetID', 'Type', 'Score']].to_csv('data/benchmarks/CPUBenchmarks.csv', index=False)
print(benchmarksCPU)