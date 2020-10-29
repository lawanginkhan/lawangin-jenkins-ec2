# Launch an EC2 and Run Jenkins
### Overview
This set of instructions will get an EC2 instance online, with public internet exposed ports for SSH and HTTP. While this specific document is for Jenkins, all sorts of backend apps can follow this general flow to get something online in short order.
### Prerequisites
1. Working login to lightfeather-sandbox
2. Some kind of SSH client. This document assumes OpenSSH (via git-bash)
### Log in to AWS console
1. Navigate to: https://lightfeather-sandbox.signin.aws.amazon.com/console
2. Verify the "Account ID or Account alias" field reads **lightfeather-sandbox**. Sometimes password managers will overwrite this field.
3. Fill in username (should be @lightfeather.io email) and password, and log in.
4. Switch region to "us-east-2"
### Set up an IAM role
IAM roles are AWS's main method of access control.  For this exercise, we need to give our Jenkins server all the permissions it needs to create other AWS objects required for deployment in this account.
1. Under IAM role, click "Create New IAM role"
2. On the IAM screen, click "Create Role"
3. With "Trust Entity AWS Service", select **EC2**, then "Next: Permissions".
4. Find pre-created **jenkins** policy, check it, then click "Next" until the "Create Role" screen.
5. Give your role a name "<your_name>-jenkins-ec2", then "Create Role"
### Start up an EC2 instance
This will be the provisioning of the server. As we configure this server, we'll give it permissions via IAM, and open up ports via security groups.
1. Find service **EC2**
2. Click instances / Launch Instance
3. Select **Ubuntu** (defaults are fine)
4. Select **t2.micro**, click "Next: Configure Instance Details"
5. Select your role from the IAM role drop down. Click "Next" until the "Security Groups" page
6. Create a new security group "<your_name>-security-group". In addition to the default SSH rule, add a Custom TCP rule: `Port 8080 from anywhere`. Then click "Review and Launch"
7. On Launch, select new key pair, give it a name, and **download the pem file**. Then "Launch Instance"
### SSH into your server
IP of your new server can be found under the instance details, once the server is in a running state.
```
mv ~/Downloads/dan-jenkins.pem ~/.ssh/
chmod 700 ~/.ssh/dan-jenkins.pem
ssh -i ~/.ssh/dan-jenkins.pem ubuntu@13.59.231.13
```
### Get Jenkins running
Most of the following commands are taken from this tutorial:
[https://www.digitalocean.com/community/tutorials/how-to-install-jenkins-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-jenkins-on-ubuntu-20-04)
```
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install -y openjdk-11-jdk jenkins nodejs awscli npm
sudo systemctl start jenkins
sudo systemctl status jenkins
```
Navigate to your Jenkins instance in the browser `http://13.59.231.13:8080`
It will ask you for a secret that's on your EC2.
```
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
Suggested plugins should be fine.

Add this private key to jenkins credentials.
1. Click "Manage Jenkins" > "Security / Manage Credentials" > "Jenkins" > "Global Credentials" > "Add Credentials"
2. Kind: "SSH Username with Private Key", ID: "github", Username: "git", Private Key:
```
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
```
### Modify the Stack Name to avoid collisions
In your checked out copy of "devops-workshop", modify `jenkins_ec2/deploy.ts` on line `new S3ui(app, 'HelloWordReactStack');` - change the name of the stack to something unique - e.g. `new S3ui(app, 'HelloWordReactStackDan');`

Check in this change to a new branch.
```
git checkout -b <your_name>
git add .
git push -u origin <your_name>
```
### Build something and deploy it
1. Click "New Item", give it a name, and select "Pipeline"
2. Scroll down to Pipeline: 
Set Definition to "Pipeline script from SCM", SCM: "Git", 
Repository URL: `git@github.com:Team-LightFeather/devops-workshop.git`
Branches to build: `<your branch>`
Script Path: `jenkins_ec2/Jenkinsfile`
3. Save, and click "Build Now"
