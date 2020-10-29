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
2. Kind: "SSH Username with Private Key", ID: "github", Username: "git", Private Key: `<your key>`
### Modify the Stack Name to avoid collisions
In your checked out copy of "devops-workshop", modify `jenkins_ec2/deploy.ts` on line `new S3ui(app, 'HelloWordReactStack');` - change the name of the stack to something unique - e.g. `new S3ui(app, 'HelloWordReactStackDan');`

Check in this change to your own github repo.
```
git remote add yourgithub https://github.com/yourgithub/example.git
git add .
git push -u yourgithub main
```
### Build something and deploy it
1. Click "New Item", give it a name, and select "Pipeline"
2. Scroll down to Pipeline: 
Set Definition to "Pipeline script from SCM", SCM: "Git", 
Repository URL: `git@github.com:yourgithub/devops-workshop.git`
Branches to build: `main`
Script Path: `jenkins_ec2/Jenkinsfile`
3. Save, and click "Build Now"
